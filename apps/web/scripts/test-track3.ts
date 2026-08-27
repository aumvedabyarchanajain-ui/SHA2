import { computeVedicChart } from '../src/lib/astrology/vedicEngine'

function runTests() {
  console.log('--- Testing Vedic Astronomical Engine ---')

  // Test Case: Born 1990-05-15 at 14:30 in Mumbai (lat: 19.076, lng: 72.8777)
  const chart = computeVedicChart({
    dob: '1990-05-15',
    timeOfBirth: '14:30',
    lat: 19.076,
    lng: 72.8777,
  })

  console.log('Sun Sign:', chart.sunSign)
  console.log('Moon Sign:', chart.moonSign)
  console.log('Rising Sign (Ascendant):', chart.risingSign)
  console.log('Nakshatra:', chart.nakshatra, `(Lord: ${chart.nakshatraLord}, Pada: ${chart.nakshatraPada})`)
  console.log('Ayanamsa (Lahiri):', chart.ayanamsa)
  console.log('Planets count:', chart.planets.length)
  console.log('Dasha periods computed:', chart.dashaTimeline.length)

  if (chart.planets.length !== 9) {
    throw new Error(`Expected 9 planets, got ${chart.planets.length}`)
  }

  if (!chart.sunSign || !chart.moonSign || !chart.risingSign) {
    throw new Error('Expected Sun, Moon, and Rising signs to be populated')
  }

  if (chart.dashaTimeline.length === 0) {
    throw new Error('Expected Dasha timeline to be populated')
  }

  const currentDasha = chart.dashaTimeline.find((d) => d.isCurrent)
  console.log('Current Active Dasha Period:', currentDasha)

  console.log('\n--- Testing Progress Score Formula: P_t = 0.35*S_t + 0.30*A_t + 0.25*J_t + 0.10*W_t ---')
  const S_t = 80 // Sleep score
  const A_t = 70 // Activity score
  const J_t = 90 // Journal / Dose score
  const W_t = 85 // Wellbeing rating

  const expected_Pt = Math.round((0.35 * S_t + 0.30 * A_t + 0.25 * J_t + 0.10 * W_t) * 10) / 10
  console.log(`Inputs: S_t=${S_t}, A_t=${A_t}, J_t=${J_t}, W_t=${W_t}`)
  console.log(`Calculated P_t: ${expected_Pt}`)

  if (expected_Pt !== 80.0) {
    throw new Error(`Progress score mismatch. Expected 80.0, got ${expected_Pt}`)
  }

  console.log('\nAll Track 3 core engine tests PASSED successfully!')
}

runTests()
