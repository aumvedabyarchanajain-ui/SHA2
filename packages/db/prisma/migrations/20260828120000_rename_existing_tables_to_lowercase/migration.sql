-- Migration A: rename existing model-cased tables to their current @@map (lowercase) names
-- Data-preserving: ALTER TABLE ... RENAME TO only. NO DROP / NO CREATE / NO DELETE.
-- PostgreSQL automatically re-points all FK/unique/PK indexes/sequences that belong to each renamed table.

ALTER TABLE "Account" RENAME TO "accounts";
ALTER TABLE "Session" RENAME TO "sessions";
ALTER TABLE "VerificationToken" RENAME TO "verification_tokens";
ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "Profile" RENAME TO "profiles";
ALTER TABLE "Course" RENAME TO "courses";
ALTER TABLE "Product" RENAME TO "products";
ALTER TABLE "Order" RENAME TO "orders";
ALTER TABLE "OrderItem" RENAME TO "order_items";
ALTER TABLE "Consent" RENAME TO "consents";
ALTER TABLE "Event" RENAME TO "events";
ALTER TABLE "Journal" RENAME TO "journals";
ALTER TABLE "DailyDose" RENAME TO "daily_doses";
ALTER TABLE "DailyDoseCompletion" RENAME TO "daily_dose_completions";
ALTER TABLE "ProgressSnapshot" RENAME TO "progress_snapshots";
ALTER TABLE "Achievement" RENAME TO "achievements";
ALTER TABLE "HealthSync" RENAME TO "health_syncs";
ALTER TABLE "HealthMetric" RENAME TO "health_metrics";
ALTER TABLE "DailyDoseOverride" RENAME TO "daily_dose_overrides";
ALTER TABLE "DailyDoseDelivery" RENAME TO "daily_dose_deliveries";
ALTER TABLE "UserPortalData" RENAME TO "user_portal_data";
ALTER TABLE "Booking" RENAME TO "bookings";
ALTER TABLE "TherapySession" RENAME TO "therapy_sessions";
ALTER TABLE "Package" RENAME TO "packages";
ALTER TABLE "CommunityMember" RENAME TO "community_members";
ALTER TABLE "Subscription" RENAME TO "subscriptions";
ALTER TABLE "LiveCircle" RENAME TO "live_circles";
ALTER TABLE "LiveCircleRSVP" RENAME TO "live_circle_rsvps";
ALTER TABLE "Challenge" RENAME TO "challenges";
ALTER TABLE "ChallengeParticipation" RENAME TO "challenge_participations";
ALTER TABLE "ChakraReveal" RENAME TO "chakra_reveals";
ALTER TABLE "ArchetypeReveal" RENAME TO "archetype_reveals";
ALTER TABLE "TarotTheme" RENAME TO "tarot_themes";
ALTER TABLE "ChartPrediction" RENAME TO "chart_predictions";
ALTER TABLE "PatternQuestion" RENAME TO "pattern_questions";
ALTER TABLE "PatternScoring" RENAME TO "pattern_scorings";
ALTER TABLE "PatternProfile" RENAME TO "pattern_profiles";
ALTER TABLE "Reel" RENAME TO "reels";
ALTER TABLE "ContentView" RENAME TO "content_views";
ALTER TABLE "CosmicNote" RENAME TO "cosmic_notes";
ALTER TABLE "DailyCheckIn" RENAME TO "daily_check_ins";
ALTER TABLE "ClientHomework" RENAME TO "client_homework";
