"""
Vedic Ephemeris & Dasha Calculation Engine for AHI Microservice.
High precision sidereal Lahiri Ayanamsa, 9 Vedic Grahas, Lagna, Nakshatras, and Vimshottari Dasha.
"""

import math
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

VEDIC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

NAKSHATRAS = [
    {"name": "Ashwini", "lord": "Ketu"},
    {"name": "Bharani", "lord": "Venus"},
    {"name": "Krittika", "lord": "Sun"},
    {"name": "Rohini", "lord": "Moon"},
    {"name": "Mrigashira", "lord": "Mars"},
    {"name": "Ardra", "lord": "Rahu"},
    {"name": "Punarvasu", "lord": "Jupiter"},
    {"name": "Pushya", "lord": "Saturn"},
    {"name": "Ashlesha", "lord": "Mercury"},
    {"name": "Magha", "lord": "Ketu"},
    {"name": "Purva Phalguni", "lord": "Venus"},
    {"name": "Uttara Phalguni", "lord": "Sun"},
    {"name": "Hasta", "lord": "Moon"},
    {"name": "Chitra", "lord": "Mars"},
    {"name": "Swati", "lord": "Rahu"},
    {"name": "Vishakha", "lord": "Jupiter"},
    {"name": "Anuradha", "lord": "Saturn"},
    {"name": "Jyeshtha", "lord": "Mercury"},
    {"name": "Mula", "lord": "Ketu"},
    {"name": "Purva Ashadha", "lord": "Venus"},
    {"name": "Uttara Ashadha", "lord": "Sun"},
    {"name": "Shravana", "lord": "Moon"},
    {"name": "Dhanishta", "lord": "Mars"},
    {"name": "Shatabhisha", "lord": "Rahu"},
    {"name": "Purva Bhadrapada", "lord": "Jupiter"},
    {"name": "Uttara Bhadrapada", "lord": "Saturn"},
    {"name": "Revati", "lord": "Mercury"},
]

DASHA_LORDS = [
    {"planet": "Ketu", "years": 7},
    {"planet": "Venus", "years": 20},
    {"planet": "Sun", "years": 6},
    {"planet": "Moon", "years": 10},
    {"planet": "Mars", "years": 7},
    {"planet": "Rahu", "years": 18},
    {"planet": "Jupiter", "years": 16},
    {"planet": "Saturn", "years": 19},
    {"planet": "Mercury", "years": 17},
]


def calculate_julian_day(year: int, month: int, day: int, hour: int = 12, minute: int = 0, second: int = 0, tz_offset: float = 5.5) -> float:
    y = year
    m = month
    if m <= 2:
        y -= 1
        m += 12
    a = math.floor(y / 100)
    b = 2 - a + math.floor(a / 4)
    ut_hours = hour + minute / 60.0 + second / 3600.0 - tz_offset
    day_fraction = ut_hours / 24.0
    return math.floor(365.25 * (y + 4716)) + math.floor(30.6001 * (m + 1)) + day + day_fraction + b - 1524.5


def calculate_lahiri_ayanamsa(jd: float) -> float:
    t = (jd - 2451545.0) / 36525.0
    return 23.8576 + 1.396042 * t + 0.000308 * t * t


def normalize_360(deg: float) -> float:
    res = deg % 360.0
    return res if res >= 0 else res + 360.0


def calculate_ascendant(jd: float, lat: float, lng: float, ayanamsa: float) -> Dict[str, Any]:
    d = jd - 2451545.0
    t = d / 36525.0
    gmst = normalize_360(280.46061837 + 360.98564736629 * d + 0.000387933 * t * t - (t * t * t) / 38710000.0)
    lst = normalize_360(gmst + lng)
    ramc = math.radians(lst)
    eps = math.radians(23.4392911 - 0.0130042 * t)
    phi = math.radians(lat)

    y = math.cos(ramc)
    x = -math.sin(ramc) * math.cos(eps) - math.tan(phi) * math.sin(eps)
    tropical_asc = normalize_360(math.degrees(math.atan2(y, x)))
    sidereal_asc = normalize_360(tropical_asc - ayanamsa)

    sign_index = int(sidereal_asc / 30) % 12
    return {
        "degree": round(sidereal_asc, 2),
        "sign": VEDIC_SIGNS[sign_index],
        "sign_degree": round(sidereal_asc % 30, 2),
    }


def calculate_planets(jd: float, ayanamsa: float, asc_deg: Optional[float] = None) -> List[Dict[str, Any]]:
    d = jd - 2451545.0
    t = d / 36525.0

    # Sun
    L0 = 280.46646 + 36000.76983 * t
    M_sun = math.radians(357.52911 + 35999.05029 * t)
    C_sun = (1.914602 - 0.004817 * t) * math.sin(M_sun) + 0.019993 * math.sin(2 * M_sun)
    sun_sid = normalize_360(L0 + C_sun - ayanamsa)

    # Moon
    Lp = 218.3164477 + 481267.88123421 * t
    D = math.radians(297.8501921 + 445267.1114034 * t)
    M_moon = math.radians(134.9633964 + 477198.8675055 * t)
    F = math.radians(93.272095 + 483202.0175233 * t)
    moon_trop = (
        Lp
        + 6.288774 * math.sin(M_moon)
        + 1.274027 * math.sin(2 * D - M_moon)
        + 0.658314 * math.sin(2 * D)
        + 0.213618 * math.sin(2 * M_moon)
        - 0.185116 * math.sin(M_sun)
        - 0.114332 * math.sin(2 * F)
    )
    moon_sid = normalize_360(moon_trop - ayanamsa)

    mars_sid = normalize_360(355.433 + 19140.299 * t + 10.69 * math.sin(math.radians(19.37 + 19140.3 * t)) - ayanamsa)
    mercury_sid = normalize_360(252.25 + 149472.67 * t + 6.34 * math.sin(math.radians(174.8 + 149472.7 * t)) - ayanamsa)
    jupiter_sid = normalize_360(34.35 + 3034.905 * t + 5.55 * math.sin(math.radians(20.38 + 3034.9 * t)) - ayanamsa)
    venus_sid = normalize_360(181.98 + 58517.815 * t + 0.78 * math.sin(math.radians(50.4 + 58517.8 * t)) - ayanamsa)
    saturn_sid = normalize_360(50.08 + 1222.114 * t + 6.35 * math.sin(math.radians(317.0 + 1222.1 * t)) - ayanamsa)
    rahu_sid = normalize_360(125.04452 - 1934.136261 * t - ayanamsa)
    ketu_sid = normalize_360(rahu_sid + 180)

    planets_raw = [
        ("Sun", sun_sid),
        ("Moon", moon_sid),
        ("Mars", mars_sid),
        ("Mercury", mercury_sid),
        ("Jupiter", jupiter_sid),
        ("Venus", venus_sid),
        ("Saturn", saturn_sid),
        ("Rahu", rahu_sid),
        ("Ketu", ketu_sid),
    ]

    asc = asc_deg if asc_deg is not None else sun_sid
    asc_sign_idx = int(asc / 30) % 12

    results = []
    for name, lon in planets_raw:
        s_idx = int(lon / 30) % 12
        n_idx = int(lon / (360 / 27)) % 27
        nak = NAKSHATRAS[n_idx]
        pada = int((lon % (360 / 27)) / (360 / 108)) + 1
        house = ((s_idx - asc_sign_idx + 12) % 12) + 1
        results.append({
            "name": name,
            "longitude": round(lon, 2),
            "sign": VEDIC_SIGNS[s_idx],
            "sign_degree": round(lon % 30, 2),
            "nakshatra": nak["name"],
            "nakshatra_lord": nak["lord"],
            "pada": pada,
            "house": house,
        })
    return results


def calculate_vimshottari_dasha(birth_dt: datetime, moon_lon: float) -> List[Dict[str, Any]]:
    nak_span = 360.0 / 27.0
    nak_idx = int(moon_lon / nak_span) % 27
    deg_in_nak = moon_lon % nak_span
    birth_lord = NAKSHATRAS[nak_idx]["lord"]

    start_lord_idx = next(i for i, d in enumerate(DASHA_LORDS) if d["planet"] == birth_lord)
    frac_remaining = max(0.0, min(1.0, 1.0 - (deg_in_nak / nak_span)))

    now = datetime.utcnow()
    current_dt = birth_dt
    periods = []

    for i in range(len(DASHA_LORDS)):
        lord_idx = (start_lord_idx + i) % len(DASHA_LORDS)
        maha = DASHA_LORDS[lord_idx]
        maha_years = maha["years"] * frac_remaining if i == 0 else maha["years"]

        for j in range(len(DASHA_LORDS)):
            antar_idx = (lord_idx + j) % len(DASHA_LORDS)
            antar = DASHA_LORDS[antar_idx]
            antar_years = (maha_years * antar["years"]) / maha["years"]
            antar_days = antar_years * 365.2425

            start_dt = current_dt
            end_dt = current_dt + timedelta(days=antar_days)
            current_dt = end_dt

            is_current = start_dt <= now < end_dt
            if is_current or len(periods) < 12 or abs((now - start_dt).total_seconds()) < 86400 * 365 * 4:
                periods.append({
                    "mahadasha": maha["planet"],
                    "antardasha": antar["planet"],
                    "start_date": start_dt.strftime("%Y-%m-%d"),
                    "end_date": end_dt.strftime("%Y-%m-%d"),
                    "is_current": is_current,
                })
    return periods


def compute_vedic_chart(dob: str, time_of_birth: Optional[str] = None, lat: float = 28.6139, lng: float = 77.209) -> Dict[str, Any]:
    parts = [int(p) for p in dob.split("-")]
    year, month, day = parts[0], parts[1], parts[2]
    hour, minute = (12, 0)
    if time_of_birth:
        tparts = [int(p) for p in time_of_birth.split(":")]
        hour, minute = tparts[0], tparts[1]

    jd = calculate_julian_day(year, month, day, hour, minute)
    ayanamsa = calculate_lahiri_ayanamsa(jd)

    rising_sign = None
    asc_deg = None
    if time_of_birth:
        asc = calculate_ascendant(jd, lat, lng, ayanamsa)
        rising_sign = asc["sign"]
        asc_deg = asc["degree"]

    planets = calculate_planets(jd, ayanamsa, asc_deg)
    sun = next(p for p in planets if p["name"] == "Sun")
    moon = next(p for p in planets if p["name"] == "Moon")

    birth_dt = datetime(year, month, day, hour, minute)
    dasha_timeline = calculate_vimshottari_dasha(birth_dt, moon["longitude"])

    return {
        "sun_sign": sun["sign"],
        "moon_sign": moon["sign"],
        "rising_sign": rising_sign,
        "nakshatra": moon["nakshatra"],
        "nakshatra_lord": moon["nakshatra_lord"],
        "nakshatra_pada": moon["pada"],
        "ayanamsa": round(ayanamsa, 2),
        "planets": planets,
        "dasha_timeline": dasha_timeline,
        "source": "vedic_engine",
    }
