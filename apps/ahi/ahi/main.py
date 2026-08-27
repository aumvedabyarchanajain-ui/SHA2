import json
import os
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .astrology import compute_vedic_chart
from .claude_client import ClaudeClient
from .models import (
    DailyDoseRequest,
    DailyDoseResponse,
    InitialPlanRequest,
    InitialPlanResponse,
    MultiSensoryDailyDose,
    PreSessionBriefRequest,
    PreSessionBriefResponse,
    ProgressScoreRequest,
    ProgressScoreResponse,
)
from .prompts import (
    DAILY_DOSE_SYSTEM_PROMPT,
    INITIAL_PLAN_SYSTEM_PROMPT,
    PRE_SESSION_BRIEF_SYSTEM_PROMPT,
    build_daily_dose_prompt,
    build_initial_plan_prompt,
    build_pre_session_brief_prompt,
)

load_dotenv()

claude: ClaudeClient | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global claude
    claude = ClaudeClient()
    yield
    if claude:
        await claude.close()


app = FastAPI(
    title="AHI — Aumveda Healing Intelligence Engine",
    description="Microservice for Vedic Astrology computation, Multi-Sensory Daily Doses, and Real-time Progress Scoring (P_t)",
    version="1.0.0",
    lifespan=lifespan,
)


class ChartRequest(BaseModel):
    dob: str
    time_of_birth: Optional[str] = None
    lat: float = 28.6139
    lng: float = 77.209


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ahi-engine", "version": "1.0.0"}


@app.post("/ahi/chart")
async def calculate_chart(req: ChartRequest):
    """Compute Vedic planetary placements, Nakshatra, and Vimshottari Dasha timeline."""
    try:
        return compute_vedic_chart(
            dob=req.dob,
            time_of_birth=req.time_of_birth,
            lat=req.lat,
            lng=req.lng,
        )
    except Exception as e:
        raise HTTPException(500, f"Chart calculation failed: {str(e)}")


@app.post("/ahi/calculate-progress", response_model=ProgressScoreResponse)
async def calculate_progress_score(req: ProgressScoreRequest):
    """Calculate real-time progress score: P_t = 0.35*S_t + 0.30*A_t + 0.25*J_t + 0.10*W_t"""
    s_t = max(0.0, min(100.0, req.sleep_score))
    a_t = max(0.0, min(100.0, req.activity_score))
    j_t = max(0.0, min(100.0, req.journal_score))
    w_t = max(0.0, min(100.0, req.wellbeing_score))

    s_weighted = 0.35 * s_t
    a_weighted = 0.30 * a_t
    j_weighted = 0.25 * j_t
    w_weighted = 0.10 * w_t

    p_t = round(s_weighted + a_weighted + j_weighted + w_weighted, 2)

    return ProgressScoreResponse(
        user_id=req.user_id,
        progress_score=p_t,
        formula_breakdown={
            "sleep_score_raw": s_t,
            "sleep_score_weighted": round(s_weighted, 2),
            "activity_score_raw": a_t,
            "activity_score_weighted": round(a_weighted, 2),
            "journal_score_raw": j_t,
            "journal_score_weighted": round(j_weighted, 2),
            "wellbeing_score_raw": w_t,
            "wellbeing_score_weighted": round(w_weighted, 2),
            "p_t": p_t,
        },
    )


@app.post("/ahi/generate-dose", response_model=DailyDoseResponse)
async def generate_dose(req: DailyDoseRequest):
    """Generate 4-part multi-sensory Daily Dose (audio frequency, affirmation, CBT reframe, micro-habit)."""
    if not claude:
        raise HTTPException(503, "AI engine client not initialized")
    prompt = build_daily_dose_prompt(req.user_context.model_dump())
    raw = await claude.generate(DAILY_DOSE_SYSTEM_PROMPT, prompt)
    try:
        data = json.loads(raw)
        dose_data = data.get("dose", data)
        return DailyDoseResponse(dose=MultiSensoryDailyDose(**dose_data))
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(502, f"AHI returned invalid JSON: {e}")


@app.post("/ahi/generate-initial-plan", response_model=InitialPlanResponse)
async def generate_initial_plan(req: InitialPlanRequest):
    """Generate 7-day initial prescription arc with 4 multi-sensory components per day."""
    if not claude:
        raise HTTPException(503, "AI engine client not initialized")
    prompt = build_initial_plan_prompt(req.user_context.model_dump())
    raw = await claude.generate(INITIAL_PLAN_SYSTEM_PROMPT, prompt, max_tokens=4096)
    try:
        data = json.loads(raw)
        doses_raw = data if isinstance(data, list) else data.get("doses", [])
        doses = [MultiSensoryDailyDose(**d) for d in doses_raw]
        return InitialPlanResponse(doses=doses)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(502, f"AHI returned invalid JSON: {e}")


@app.post("/ahi/pre-session-brief", response_model=PreSessionBriefResponse)
async def pre_session_brief(req: PreSessionBriefRequest):
    """Synthesize clinical-spiritual brief for practitioners."""
    if not claude:
        raise HTTPException(503, "AI engine client not initialized")
    user_context = {"user_id": req.user_id}
    prompt = build_pre_session_brief_prompt(
        user_id=req.user_id,
        user_context=user_context,
        recent_dose_themes=[],
        previous_session_count=0,
        journal_themes=[],
    )
    raw = await claude.generate(PRE_SESSION_BRIEF_SYSTEM_PROMPT, prompt, max_tokens=2048)
    try:
        brief_data = json.loads(raw)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(502, f"AHI returned invalid JSON: {e}")
    return PreSessionBriefResponse(
        user_id=req.user_id,
        profile=user_context,
        practitioner_focus_areas=brief_data.get("practitioner_focus_areas", []),
    )
