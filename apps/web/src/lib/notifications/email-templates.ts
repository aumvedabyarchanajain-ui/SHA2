/**
 * Responsive HTML Email Templates for Aumveda Automated Lifecycles
 */

export function getDailyDoseEmailHtml({
  name,
  chakra,
  title,
  audioUrl,
  ritualUrl,
}: {
  name: string
  chakra: string
  title: string
  audioUrl?: string
  ritualUrl: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Morning Daily Dose • Aumveda</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0f12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0f12; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background: #161a22; border: 1px solid #2d3342; border-radius: 16px; overflow: hidden; padding: 32px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #d4af37; text-transform: uppercase;">AUMVEDA</span>
              <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #9ca3af; text-transform: uppercase;">Astro-Somatic Daily Sanctuary</p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="font-size: 18px; color: #e5e7eb; margin: 0 0 16px 0;">Namaste <strong>${name}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #9ca3af; margin: 0 0 24px 0;">
                Today's celestial transit aligns with your <strong>${chakra}</strong>. Begin your morning with consecrated breathwork and sacred sound.
              </p>
              <div style="background: rgba(212, 175, 55, 0.08); border-left: 4px solid #d4af37; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
                <h3 style="margin: 0 0 8px 0; font-size: 17px; color: #f9fafb;">${title}</h3>
                <p style="margin: 0; font-size: 13px; color: #d1d5db;">Chakra Alignment: <span style="color: #d4af37; font-weight: 600;">${chakra}</span></p>
              </div>
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${ritualUrl}" style="display: inline-block; background: #d4af37; color: #0d0f12; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px; letter-spacing: 0.5px;">
                  Begin Today's Practice &rarr;
                </a>
              </div>
              ${
                audioUrl
                  ? `<p style="text-align: center; font-size: 13px; color: #9ca3af; margin: 0 0 24px 0;">Audio player directly in ritual dashboard.</p>`
                  : ''
              }
              <hr style="border: none; border-top: 1px solid #2d3342; margin: 24px 0;" />
              <p style="font-size: 12px; line-height: 1.5; color: #6b7280; text-align: center; margin: 0;">
                You received this because you are enrolled in Aumveda Daily Dose.<br />
                Aumveda Holistic Sanctuary • Mumbai, India
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function getCourseReengagementEmailHtml({
  name,
  courseTitle,
  lastCompletedLessonTitle,
  resumeUrl,
}: {
  name: string
  courseTitle: string
  lastCompletedLessonTitle: string
  resumeUrl: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Sacred Journey Awaits • Aumveda</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0f12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0f12; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background: #161a22; border: 1px solid #2d3342; border-radius: 16px; overflow: hidden; padding: 32px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #d4af37; text-transform: uppercase;">AUMVEDA</span>
              <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #9ca3af; text-transform: uppercase;">Somatic LMS & Wisdom Portal</p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="font-size: 18px; color: #e5e7eb; margin: 0 0 16px 0;">Dear <strong>${name}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #9ca3af; margin: 0 0 20px 0;">
                We noticed you paused midway through <strong>${courseTitle}</strong>. In Ayurveda and somatic healing, pauses are natural integrations — but returning to the practice anchors the shift into your cellular memory.
              </p>
              <div style="background: rgba(255, 255, 255, 0.04); border: 1px dashed #374151; border-radius: 10px; padding: 18px; margin-bottom: 26px;">
                <p style="margin: 0 0 6px 0; font-size: 13px; color: #9ca3af;">Last Completed Milestone:</p>
                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #e5e7eb;">${lastCompletedLessonTitle}</p>
              </div>
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${resumeUrl}" style="display: inline-block; background: #d4af37; color: #0d0f12; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                  Resume Your Lesson &rarr;
                </a>
              </div>
              <p style="font-size: 14px; font-style: italic; color: #9ca3af; margin: 0 0 24px 0; text-align: center;">
                "Healing is not a destination of speed, but of presence."<br />
                — Sejal Jain
              </p>
              <hr style="border: none; border-top: 1px solid #2d3342; margin: 24px 0;" />
              <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
                Aumveda Sanctum • You are receiving this as an active course enrollee.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function getCrystalActivationEmailHtml({
  name,
  orderId,
  dominantChakra,
  trackingUrl,
}: {
  name: string
  orderId: string
  dominantChakra: string
  trackingUrl: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consecrated Crystal Activation Guide • Order #${orderId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0f12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0f12; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background: #161a22; border: 1px solid #2d3342; border-radius: 16px; overflow: hidden; padding: 32px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #d4af37; text-transform: uppercase;">AUMVEDA</span>
              <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #9ca3af; text-transform: uppercase;">Consecrated Crystals & Energy Alchemy</p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="font-size: 18px; color: #e5e7eb; margin: 0 0 16px 0;">Namaste <strong>${name}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #9ca3af; margin: 0 0 20px 0;">
                Your sacred crystal order <strong>#${orderId}</strong> has been hand-selected, cleansed with Vedic herbs, and dispatched via Shiprocket.
              </p>
              <h3 style="color: #d4af37; font-size: 16px; margin: 24px 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">
                Your Natal Activation Ritual (${dominantChakra})
              </h3>
              <ol style="font-size: 14px; line-height: 1.8; color: #d1d5db; padding-left: 20px; margin-bottom: 28px;">
                <li><strong>Sunlight / Moonlight Cleanse:</strong> Place your stones under the morning dawn sun for 15 minutes upon arrival.</li>
                <li><strong>Heart Alignment:</strong> Hold the crystal in your left palm over your ${dominantChakra} and take 7 deep diaphragmatic breaths.</li>
                <li><strong>Bija Mantra Chanting:</strong> Chant the sacred sound <em>LAM / VAM / RAM / YAM / HAM</em> 9 times into the stone.</li>
              </ol>
              <div style="text-align: center; margin-bottom: 28px;">
                <a href="${trackingUrl}" style="display: inline-block; background: #d4af37; color: #0d0f12; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                  Track Order Shipment &rarr;
                </a>
              </div>
              <hr style="border: none; border-top: 1px solid #2d3342; margin: 24px 0;" />
              <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
                Blessings in Light,<br />Archana & Sejal Jain • Aumveda Sanctum
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
