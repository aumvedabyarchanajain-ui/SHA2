import assert from 'node:assert'
import {
  hashPII,
  formatPhone,
  generateEventId,
  formatMetaCapiPayload,
  formatGa4Payload,
  dispatchServerEvent,
  ServerEventPayload,
} from '../gtm-server'

console.log('🧪 Starting GTM Server & Telemetry Deduplication Tests...\n')

// ─── Test 1: PII Hashing & Normalization ──────────────────────────────────────
{
  console.log('▶ Test 1: SHA-256 PII Hashing & Normalization')
  const email = ' Test.User@Aumveda.Com '
  const hashedEmail = hashPII(email)
  // expected sha256("test.user@aumveda.com")
  assert.strictEqual(
    hashedEmail,
    'f60d70958bccb388c1de9f23184d9ea3d3ec31dd4dcf1302bcb02606bdf1ba9d',
    'Email hashing must trim, lowercase, and SHA-256'
  )

  const phone10 = '9876543210'
  assert.strictEqual(formatPhone(phone10), '919876543210', 'Indian 10-digit phone must prepend 91')

  const phoneFormatted = '+91 98765-43210'
  assert.strictEqual(formatPhone(phoneFormatted), '919876543210', 'Phone must strip spaces and symbols')
  console.log('  ✅ PII Hashing & Phone formatting passed.')
}

// ─── Test 2: Meta CAPI Payload Transformation (course_enrolled) ──────────────
{
  console.log('\n▶ Test 2: Meta CAPI course_enrolled event transformation')
  const eventId = 'evt_test_enroll_12345'
  const payload: ServerEventPayload = {
    eventName: 'course_enrolled',
    eventId,
    eventTime: 1700000000,
    eventSourceUrl: 'https://aumveda.com/courses/somatic-ayurveda',
    user: {
      userId: 'usr_abc123',
      email: 'student@aumveda.com',
      phone: '+91 9876543210',
      firstName: 'Aarav',
      lastName: 'Sharma',
      clientIp: '203.0.113.195',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      fbp: 'fb.1.1700000000.123456789',
      fbc: 'fb.1.1700000000.IwAR0abc123',
    },
    customData: {
      currency: 'INR',
      value: 4999,
      orderId: 'ord_course_987',
      courseId: 'crs_somatic_01',
      contentIds: ['crs_somatic_01'],
      contentType: 'product',
      contents: [{ id: 'crs_somatic_01', quantity: 1, item_price: 4999 }],
    },
  }

  const metaEvent = formatMetaCapiPayload(payload)
  assert.strictEqual(metaEvent.event_name, 'Subscribe', 'course_enrolled must map to Subscribe in Meta')
  assert.strictEqual(metaEvent.event_id, eventId, 'event_id must match for deduplication')
  assert.strictEqual(metaEvent.event_time, 1700000000)
  assert.ok(metaEvent.user_data.em?.[0], 'email hash must be present')
  assert.ok(metaEvent.user_data.ph?.[0], 'phone hash must be present')
  assert.ok(metaEvent.user_data.fn?.[0], 'firstName hash must be present')
  assert.strictEqual(metaEvent.user_data.client_ip_address, '203.0.113.195')
  assert.strictEqual(metaEvent.user_data.client_user_agent, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
  assert.strictEqual(metaEvent.user_data.fbp, 'fb.1.1700000000.123456789')
  assert.strictEqual(metaEvent.custom_data?.value, 4999)
  assert.strictEqual(metaEvent.custom_data?.order_id, 'ord_course_987')
  console.log('  ✅ Meta CAPI course_enrolled transformation passed.')
}

// ─── Test 3: Meta CAPI purchase event transformation ─────────────────────────
{
  console.log('\n▶ Test 3: Meta CAPI purchase event transformation')
  const payload: ServerEventPayload = {
    eventName: 'purchase',
    eventId: 'evt_test_purchase_888',
    user: {
      userId: 'usr_buyer_99',
      email: 'buyer@aumveda.com',
    },
    customData: {
      currency: 'INR',
      value: 12500,
      orderId: 'ord_crystal_555',
      contentIds: ['crys_amethyst_01', 'crys_citrine_02'],
    },
  }

  const metaEvent = formatMetaCapiPayload(payload)
  assert.strictEqual(metaEvent.event_name, 'Purchase')
  assert.strictEqual(metaEvent.event_id, 'evt_test_purchase_888')
  assert.strictEqual(metaEvent.custom_data?.value, 12500)
  assert.strictEqual(metaEvent.custom_data?.currency, 'INR')
  console.log('  ✅ Meta CAPI purchase transformation passed.')
}

// ─── Test 4: GA4 Measurement Protocol payload transformation ─────────────────
{
  console.log('\n▶ Test 4: GA4 Measurement Protocol payload transformation')
  const payload: ServerEventPayload = {
    eventName: 'daily_dose_completed',
    eventId: 'evt_dose_456',
    user: {
      userId: 'usr_seeker_1',
      clientId: 'ga4_cid_999.888',
    },
    customData: {
      dailyDoseId: 'dose_solar_plexus_07',
      dominantChakra: 'MANIPURA',
      streakCount: 14,
      durationSec: 420,
    },
  }

  const ga4Payload = formatGa4Payload(payload)
  assert.strictEqual(ga4Payload.client_id, 'ga4_cid_999.888')
  assert.strictEqual(ga4Payload.user_id, 'usr_seeker_1')
  assert.strictEqual(ga4Payload.events.length, 1)
  assert.strictEqual(ga4Payload.events[0].name, 'daily_dose_completed')
  assert.strictEqual(ga4Payload.events[0].params.event_id, 'evt_dose_456')
  assert.strictEqual(ga4Payload.events[0].params.dominantChakra, 'MANIPURA')
  assert.strictEqual(ga4Payload.events[0].params.streakCount, 14)
  console.log('  ✅ GA4 Measurement Protocol transformation passed.')
}

// ─── Test 5: Deduplication ID Generation & Integrity ─────────────────────────
{
  console.log('\n▶ Test 5: Event ID Deduplication Integrity')
  const id1 = generateEventId()
  const id2 = generateEventId()
  assert.notStrictEqual(id1, id2, 'Generated event IDs must be unique')
  assert.ok(id1.startsWith('evt_'), 'Event ID must have standard evt_ prefix')
  console.log('  ✅ Deduplication ID generation passed.')
}

// ─── Test 6: Dispatch Pipeline Execution Resilience ─────────────────────────
{
  console.log('\n▶ Test 6: Dispatch Pipeline Execution (Dry run / Mocked fetch)')
  const payload: ServerEventPayload = {
    eventName: 'portal_completed',
    eventId: 'evt_portal_test_999',
    user: {
      userId: 'usr_portal_01',
      email: 'portal@aumveda.com',
    },
    customData: {
      dominantChakra: 'ANAHATA',
      archetype: 'The Visionary Healer',
    },
  }

  dispatchServerEvent(payload).then((res) => {
    assert.strictEqual(res.eventId, 'evt_portal_test_999')
    assert.strictEqual(res.success, true)
    console.log('  ✅ Dispatch pipeline resilience passed.\n')
    console.log('🎉 ALL 6 GTM SERVER & CAPI DEDUPLICATION TESTS PASSED SUCCESSFULLY!\n')
  })
}
