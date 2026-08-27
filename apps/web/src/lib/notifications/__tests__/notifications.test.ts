import assert from 'node:assert'
import { sendDeviceNotification } from '../device-push'
import {
  getDailyDoseEmailHtml,
  getCourseReengagementEmailHtml,
  getCrystalActivationEmailHtml,
} from '../email-templates'

console.log('🧪 Starting Multi-Channel Notification & Email Template Tests...\n')

// ─── Test 1: Device Push Notification Simulation & Dispatch ─────────────────
{
  console.log('▶ Test 1: Device Push Notification Dispatch')
  sendDeviceNotification({
    userId: 'usr_test_123',
    title: '✨ Daily Dose Ready',
    body: 'Your Heart Chakra alignment is prepared.',
    clickActionUrl: 'https://app.aumveda.com/daily-dose/heart-alignment',
  }).then((res) => {
    assert.strictEqual(res.success, true, 'Device push dispatch should succeed')
    assert.strictEqual(res.simulated, true, 'In dev mode without FCM key, push should simulate')
    console.log('  ✅ Device push notification dispatch passed.')
  })
}

// ─── Test 2: Daily Dose Email Template Generation ────────────────────────────
{
  console.log('\n▶ Test 2: Daily Dose Email Template HTML generation')
  const html = getDailyDoseEmailHtml({
    name: 'Aarav',
    chakra: 'Anahata (Heart Chakra)',
    title: 'Consecrated Morning Breathwork',
    audioUrl: 'https://assets.aumveda.com/audio/test.mp3',
    ritualUrl: 'https://app.aumveda.com/daily-dose/morning-alignment',
  })

  assert.ok(html.includes('Aarav'), 'Email should contain user name')
  assert.ok(html.includes('Anahata (Heart Chakra)'), 'Email should contain chakra name')
  assert.ok(html.includes('Consecrated Morning Breathwork'), 'Email should contain ritual title')
  assert.ok(html.includes('https://app.aumveda.com/daily-dose/morning-alignment'), 'Email should contain ritual link')
  console.log('  ✅ Daily Dose email template test passed.')
}

// ─── Test 3: Course Re-engagement Email Template Generation ──────────────────
{
  console.log('\n▶ Test 3: Course Re-engagement Email Template generation')
  const html = getCourseReengagementEmailHtml({
    name: 'Priya',
    courseTitle: 'Somatic Ayurveda Foundations',
    lastCompletedLessonTitle: 'Module 2: Prana & Vayu Dynamics',
    resumeUrl: 'https://app.aumveda.com/courses/somatic-ayurveda/learn',
  })

  assert.ok(html.includes('Priya'), 'Email should contain student name')
  assert.ok(html.includes('Somatic Ayurveda Foundations'), 'Email should contain course title')
  assert.ok(html.includes('Module 2: Prana & Vayu Dynamics'), 'Email should contain last lesson milestone')
  assert.ok(html.includes('Sejal Jain'), 'Email should contain Sejal quote/signature')
  console.log('  ✅ Course re-engagement email template test passed.')
}

// ─── Test 4: Crystal Activation Email Template Generation ────────────────────
{
  console.log('\n▶ Test 4: Crystal Activation Ritual Email Template generation')
  const html = getCrystalActivationEmailHtml({
    name: 'Rohan',
    orderId: 'ord_crys_789',
    dominantChakra: 'Solar Plexus (Manipura)',
    trackingUrl: 'https://app.aumveda.com/orders/ord_crys_789',
  })

  assert.ok(html.includes('Rohan'), 'Email should contain customer name')
  assert.ok(html.includes('ord_crys_789'), 'Email should contain order ID')
  assert.ok(html.includes('Solar Plexus (Manipura)'), 'Email should contain natal chakra alignment')
  assert.ok(html.includes('Bija Mantra'), 'Email should contain Bija Mantra instructions')
  console.log('  ✅ Crystal activation email template test passed.\n')
  console.log('🎉 ALL MULTI-CHANNEL AUTOMATION NOTIFICATION TESTS PASSED!\n')
}
