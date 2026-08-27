import { prisma } from '@aumveda/db'

export interface ProgressBreakdown {
  P_t: number
  S_t: number // Sleep Score
  A_t: number // Activity Score
  J_t: number // Journal & Daily Dose Score
  W_t: number // Subjective Wellbeing Score
  weighted: {
    sleep: number
    activity: number
    journal: number
    wellbeing: number
  }
}

/**
 * Calculates the canonical real-time Progress Score (P_t)
 * Formula: P_t = 0.35 * S_t + 0.30 * A_t + 0.25 * J_t + 0.10 * W_t
 */
export async function calculateUserProgressScore(userId: string): Promise<ProgressBreakdown> {
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // 1. S_t (Sleep Score): Latest sleep score from HealthMetric or fallback 50
  const latestHealthMetric = await prisma.healthMetric.findFirst({
    where: { userId },
    orderBy: { metricDate: 'desc' },
  })

  let S_t = 50
  if (latestHealthMetric?.sleepScore != null) {
    S_t = Math.max(0, Math.min(100, latestHealthMetric.sleepScore))
  } else if (latestHealthMetric?.sleepMinutes != null) {
    // Standard target 8 hours = 480 mins
    const efficiency = Math.min(latestHealthMetric.sleepMinutes / 480, 1.0)
    S_t = Math.round(efficiency * 100)
  }

  // 2. A_t (Activity Score): From steps & workout minutes vs baseline
  let A_t = 40
  if (latestHealthMetric?.steps != null || latestHealthMetric?.workoutMinutes != null) {
    const stepTarget = 8000
    const workoutTarget = 30
    const stepRatio = Math.min((latestHealthMetric.steps ?? 0) / stepTarget, 1.0) * 60
    const workoutRatio = Math.min((latestHealthMetric.workoutMinutes ?? 0) / workoutTarget, 1.0) * 40
    A_t = Math.round(stepRatio + workoutRatio)
  }

  // 3. J_t (Journaling & Daily Dose completion consistency over trailing 7 days)
  const journalCount = await prisma.journal.count({
    where: { userId, isDeleted: false, createdAt: { gte: sevenDaysAgo } },
  })
  const doseCompletions = await prisma.dailyDoseCompletion.count({
    where: { userId, completedAt: { gte: sevenDaysAgo } },
  })
  // Blend journal + daily dose (max 7 days)
  const activeInterventions = Math.min(journalCount + doseCompletions, 14)
  const J_t = Math.min(100, Math.round((activeInterventions / 10) * 100))

  // 4. W_t (Subjective Wellbeing Rating): Moods 1-5 scaled to 0-100
  const journalsWithMood = await prisma.journal.findMany({
    where: { userId, isDeleted: false, mood: { not: null } },
    orderBy: { createdAt: 'desc' },
    take: 7,
    select: { mood: true },
  })

  const avgMood = journalsWithMood.length
    ? journalsWithMood.reduce((acc, j) => acc + (j.mood ?? 3), 0) / journalsWithMood.length
    : 3.5
  const W_t = Math.round(avgMood * 20) // 1-5 * 20 = 20-100

  // Canonical Progress Formula
  const sWeighted = 0.35 * S_t
  const aWeighted = 0.30 * A_t
  const jWeighted = 0.25 * J_t
  const wWeighted = 0.10 * W_t

  const P_t = Math.round((sWeighted + aWeighted + jWeighted + wWeighted) * 10) / 10

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Upsert daily snapshot
  await prisma.progressSnapshot.upsert({
    where: { userId_date: { userId, date: today } },
    create: {
      userId,
      date: today,
      score: P_t,
      sleepScore: S_t,
      activityScore: A_t,
      journalScore: J_t,
      wellbeingScore: W_t,
    },
    update: {
      score: P_t,
      sleepScore: S_t,
      activityScore: A_t,
      journalScore: J_t,
      wellbeingScore: W_t,
    },
  })

  // Update profile
  await prisma.profile.update({
    where: { userId },
    data: { progress: P_t },
  })

  // Check achievements
  await checkProgressAchievements(userId)

  return {
    P_t,
    S_t,
    A_t,
    J_t,
    W_t,
    weighted: {
      sleep: Math.round(sWeighted * 10) / 10,
      activity: Math.round(aWeighted * 10) / 10,
      journal: Math.round(jWeighted * 10) / 10,
      wellbeing: Math.round(wWeighted * 10) / 10,
    },
  }
}

async function checkProgressAchievements(userId: string) {
  try {
    const eightDaysAgo = new Date()
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)
    eightDaysAgo.setHours(0, 0, 0, 0)

    const completions = await prisma.dailyDoseCompletion.findMany({
      where: { userId, completedAt: { gte: eightDaysAgo } },
      select: { completedAt: true },
    })

    const distinctDays = new Set(
      completions.map((c) => c.completedAt.toISOString().slice(0, 10))
    )

    if (distinctDays.size >= 7) {
      await prisma.achievement.upsert({
        where: { userId_key: { userId, key: '7_DAY_STREAK' } },
        create: { userId, key: '7_DAY_STREAK' },
        update: {},
      })
    }

    const journalCount = await prisma.journal.count({ where: { userId, isDeleted: false } })
    if (journalCount >= 1) {
      await prisma.achievement.upsert({
        where: { userId_key: { userId, key: 'FIRST_JOURNAL' } },
        create: { userId, key: 'FIRST_JOURNAL' },
        update: {},
      })
    }
  } catch (err) {
    console.warn('[progressEngine] Achievement check warning:', err)
  }
}
