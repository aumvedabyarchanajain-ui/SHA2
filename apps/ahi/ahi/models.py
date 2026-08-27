from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class UserContext(BaseModel):
    profile_result: str = Field(description="anxious_achiever|frozen_heart|wounded_warrior|silent_sufferer|lost_soul|awakening_one")
    chakra: Optional[str] = None
    archetype: Optional[str] = None
    tarot_theme: Optional[str] = None
    moon_sign: Optional[str] = None
    sun_sign: Optional[str] = None
    rising_sign: Optional[str] = None
    current_mahadasha: Optional[str] = None
    current_antardasha: Optional[str] = None
    days_in_journey: int = 0
    moon_phase: Optional[str] = None
    last_session_notes: Optional[str] = None
    intention_text: Optional[str] = None
    recent_journal_themes: Optional[List[str]] = None


class AudioFrequencyComponent(BaseModel):
    frequency_hz: int = Field(description="Healing solfeggio / brainwave frequency, e.g. 528, 432, 396, 639")
    frequency_name: str = Field(description="e.g. 528 Hz DNA Repair & Miracles, 432 Hz Deep Cellular Peace")
    duration_seconds: int = Field(default=180, description="Duration in seconds (60-180)")
    audio_url: Optional[str] = None
    guidance: str = Field(description="How to listen / somatic instruction")


class MultiSensoryDailyDose(BaseModel):
    date: str
    theme: str
    chakra: str
    audio_frequency: AudioFrequencyComponent
    affirmation: str = Field(description="1-line neuroplastic subconscious seed affirmation")
    cbt_reframe: str = Field(description="Astrologically and psychologically contextualized daily cognitive reflection prompt")
    micro_habit: str = Field(description="60-second somatic release or environmental Vastu alignment action")
    practitioner_note: Optional[str] = None


class DailyDoseRequest(BaseModel):
    user_id: str
    user_context: UserContext


class DailyDoseResponse(BaseModel):
    dose: MultiSensoryDailyDose


class InitialPlanRequest(BaseModel):
    user_id: str
    user_context: UserContext


class InitialPlanResponse(BaseModel):
    doses: List[MultiSensoryDailyDose] = Field(min_length=7, max_length=7)


class ProgressScoreRequest(BaseModel):
    user_id: str
    sleep_score: float = Field(ge=0, le=100, description="S_t derived from sleep minutes & efficiency")
    activity_score: float = Field(ge=0, le=100, description="A_t derived from steps & active workout minutes")
    journal_score: float = Field(ge=0, le=100, description="J_t derived from journaling & dose completion consistency")
    wellbeing_score: float = Field(ge=0, le=100, description="W_t derived from subjective wellbeing & mood")


class ProgressScoreResponse(BaseModel):
    user_id: str
    progress_score: float = Field(description="P_t = 0.35*S_t + 0.30*A_t + 0.25*J_t + 0.10*W_t")
    formula_breakdown: Dict[str, float]


class PreSessionBriefRequest(BaseModel):
    user_id: str


class PreSessionBriefResponse(BaseModel):
    user_id: str
    profile: Dict[str, Any]
    portal_summary: Dict[str, Any] = Field(default_factory=dict)
    recent_dose_themes: List[str] = Field(default_factory=list)
    previous_session_count: int = 0
    practitioner_focus_areas: List[str] = Field(default_factory=list)
