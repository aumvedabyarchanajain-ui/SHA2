-- Migration B (corrected): complete schema alignment against current Prisma schema
-- 0) Resolve legacy courses.id drift (INTEGER -> TEXT) required by current schema
-- 1) CREATE missing ENUM types
-- 2) CREATE genuinely-missing current-schema tables (18) + indexes/FKs
-- 3) ADD genuinely-missing columns to existing (renamed) tables
-- Data-preserving: additive + courses.id conversion (courses is EMPTY, 0 rows). NO DROP of data-bearing tables, no DELETE, no TRUNCATE.


-- 0) COURSES.id conversion INTEGER -> TEXT (courses is empty)

-- Legacy tables Enrolment & Module (empty, NOT in current schema) hold FKs referencing courses(id);
-- drop ONLY those two incompatible legacy FK constraints (tables retained, no data touched).

ALTER TABLE "Enrolment" DROP CONSTRAINT IF EXISTS "Enrolment_courseId_fkey";

ALTER TABLE "Module" DROP CONSTRAINT IF EXISTS "Module_courseId_fkey";

ALTER TABLE "courses" ALTER COLUMN "id" DROP DEFAULT;

DROP SEQUENCE IF EXISTS "Course_id_seq";

ALTER TABLE "courses" ALTER COLUMN "id" TYPE text;


-- 1) ENUMS

CREATE TYPE "CourseLevel" AS ENUM ('ALL_LEVELS', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED');

CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED');

CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

CREATE TYPE "PaymentGateway" AS ENUM ('CASHFREE', 'RAZORPAY', 'EAZEBUS', 'EASEBUZZ', 'EASEBUZZ_PRIMARY', 'EASEBUZZ_SECONDARY');

CREATE TYPE "ServiceType" AS ENUM ('ASTROLOGY_ARCHANA', 'SOMATIC_SEJAL', 'DUAL_SYNERGY', 'MENTORSHIP_INTENSIVE', 'VASTU_CONSULTATION', 'DISCOVERY_CALL');

CREATE TYPE "BookingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'RESCHEDULED', 'CANCELLED', 'NO_SHOW');


-- 2) NEW 18 TABLES

CREATE TABLE "course_modules" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 1,
    "orderIndex" INTEGER DEFAULT 1,
    "durationSec" INTEGER,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "course_lessons" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "youtubeVideoId" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 1,
    "isFreePreview" BOOLEAN NOT NULL DEFAULT false,
    "workbookPdfUrl" TEXT,
    "audioDownloadUrl" TEXT,
    "reflectionPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "course_lessons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lesson_reflections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "reflectionText" TEXT NOT NULL,
    "mood" INTEGER,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lesson_reflections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lesson_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "watchTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "maxWatchTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "lastPlayedPositionSec" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "course_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "course_quizzes" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "passingScorePct" INTEGER NOT NULL DEFAULT 80,
    "questionsJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "course_quizzes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quiz_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "scorePct" INTEGER NOT NULL,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "submittedAnswersJson" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quiz_submissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "course_certificates" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT NOT NULL,
    "verificationHash" TEXT NOT NULL,
    CONSTRAINT "course_certificates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "course_reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewText" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "course_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "practitioner_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "specialties" TEXT[],
    "languages" TEXT[] DEFAULT ARRAY['English', 'Hindi']::TEXT[],
    "experienceYears" INTEGER NOT NULL DEFAULT 10,
    "hourlyRateINR" DECIMAL(10,2) NOT NULL DEFAULT 3500.00,
    "calBookingUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "practitioner_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "service_offerings" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "practitionerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headline" TEXT,
    "description" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "priceINR" DECIMAL(10,2) NOT NULL,
    "salePriceINR" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxParticipants" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "service_offerings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "service_bookings" (
    "id" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceOfferingId" TEXT,
    "practitionerName" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledStartTime" TIMESTAMP(3) NOT NULL,
    "scheduledEndTime" TIMESTAMP(3) NOT NULL,
    "meetingUrl" TEXT,
    "calEventId" TEXT,
    "preSessionBriefJson" JSONB,
    "practitionerNotes" TEXT,
    "prescriptionJson" JSONB,
    "feeINR" DECIMAL(10,2) NOT NULL,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "service_bookings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "community_circles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "coverImageUrl" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "community_circles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "circle_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "circle_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "circle_posts" (
    "id" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "circle_posts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "circle_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "circle_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "webhook_event_logs" (
    "id" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "webhook_event_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pre_session_briefs" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "orderId" TEXT,
    "userId" TEXT NOT NULL,
    "practitionerName" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "astrologicalSummary" JSONB NOT NULL,
    "somaticSummary" JSONB NOT NULL,
    "clientIntakeSummary" JSONB NOT NULL,
    "sessionFocusThemes" TEXT[],
    "recommendedRemedies" TEXT[],
    "googleCalendarEventId" TEXT,
    "isDelivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pre_session_briefs_pkey" PRIMARY KEY ("id")
);


-- 2b) NEW-TABLE INDEXES / UNIQUES

CREATE INDEX "course_modules_courseId_sortOrder_idx" ON "course_modules"("courseId", "sortOrder");

CREATE INDEX "course_lessons_moduleId_sortOrder_idx" ON "course_lessons"("moduleId", "sortOrder");

CREATE INDEX "lesson_reflections_userId_idx" ON "lesson_reflections"("userId");

CREATE UNIQUE INDEX "lesson_reflections_userId_lessonId_key" ON "lesson_reflections"("userId", "lessonId");

CREATE INDEX "lesson_progress_userId_isCompleted_idx" ON "lesson_progress"("userId", "isCompleted");

CREATE UNIQUE INDEX "lesson_progress_userId_lessonId_key" ON "lesson_progress"("userId", "lessonId");

CREATE INDEX "course_enrollments_userId_status_idx" ON "course_enrollments"("userId", "status");

CREATE UNIQUE INDEX "course_enrollments_userId_courseId_key" ON "course_enrollments"("userId", "courseId");

CREATE INDEX "course_quizzes_moduleId_idx" ON "course_quizzes"("moduleId");

CREATE INDEX "quiz_submissions_userId_quizId_idx" ON "quiz_submissions"("userId", "quizId");

CREATE UNIQUE INDEX "course_certificates_certificateNumber_key" ON "course_certificates"("certificateNumber");

CREATE UNIQUE INDEX "course_certificates_verificationHash_key" ON "course_certificates"("verificationHash");

CREATE UNIQUE INDEX "course_certificates_userId_courseId_key" ON "course_certificates"("userId", "courseId");

CREATE UNIQUE INDEX "course_reviews_userId_courseId_key" ON "course_reviews"("userId", "courseId");

CREATE UNIQUE INDEX "practitioner_profiles_userId_key" ON "practitioner_profiles"("userId");

CREATE UNIQUE INDEX "practitioner_profiles_slug_key" ON "practitioner_profiles"("slug");

CREATE UNIQUE INDEX "service_offerings_slug_key" ON "service_offerings"("slug");

CREATE INDEX "service_offerings_practitionerId_isActive_idx" ON "service_offerings"("practitionerId", "isActive");

CREATE UNIQUE INDEX "service_bookings_bookingReference_key" ON "service_bookings"("bookingReference");

CREATE INDEX "service_bookings_userId_status_idx" ON "service_bookings"("userId", "status");

CREATE INDEX "service_bookings_scheduledStartTime_idx" ON "service_bookings"("scheduledStartTime");

CREATE UNIQUE INDEX "community_circles_slug_key" ON "community_circles"("slug");

CREATE UNIQUE INDEX "circle_members_userId_circleId_key" ON "circle_members"("userId", "circleId");

CREATE INDEX "circle_posts_circleId_createdAt_idx" ON "circle_posts"("circleId", "createdAt");

CREATE INDEX "circle_comments_postId_createdAt_idx" ON "circle_comments"("postId", "createdAt");

CREATE UNIQUE INDEX "webhook_event_logs_eventId_key" ON "webhook_event_logs"("eventId");

CREATE INDEX "webhook_event_logs_gateway_eventId_idx" ON "webhook_event_logs"("gateway", "eventId");

CREATE UNIQUE INDEX "pre_session_briefs_bookingId_key" ON "pre_session_briefs"("bookingId");

CREATE INDEX "pre_session_briefs_userId_idx" ON "pre_session_briefs"("userId");

CREATE INDEX "pre_session_briefs_practitionerName_idx" ON "pre_session_briefs"("practitionerName");


-- 2c) NEW-TABLE FOREIGN KEYS

ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lesson_reflections" ADD CONSTRAINT "lesson_reflections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lesson_reflections" ADD CONSTRAINT "lesson_reflections_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "course_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "course_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_quizzes" ADD CONSTRAINT "course_quizzes_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "course_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_certificates" ADD CONSTRAINT "course_certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_certificates" ADD CONSTRAINT "course_certificates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "practitioner_profiles" ADD CONSTRAINT "practitioner_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "service_offerings" ADD CONSTRAINT "service_offerings_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "practitioner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_serviceOfferingId_fkey" FOREIGN KEY ("serviceOfferingId") REFERENCES "service_offerings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "community_circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "circle_posts" ADD CONSTRAINT "circle_posts_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "community_circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "circle_posts" ADD CONSTRAINT "circle_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "circle_comments" ADD CONSTRAINT "circle_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "circle_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "circle_comments" ADD CONSTRAINT "circle_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pre_session_briefs" ADD CONSTRAINT "pre_session_briefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- 3) ADD MISSING COLUMNS TO EXISTING TABLES

ALTER TABLE "users" ADD COLUMN "phone" TEXT;

ALTER TABLE "users" ADD COLUMN "dominantChakra" TEXT;

ALTER TABLE "courses" ADD COLUMN "subtitle" TEXT;

ALTER TABLE "courses" ADD COLUMN "thumbnailUrl" TEXT;

ALTER TABLE "courses" ADD COLUMN "trailerYoutubeId" TEXT;

ALTER TABLE "courses" ADD COLUMN "instructorName" TEXT NOT NULL DEFAULT 'Archana & Sejal Jain';

ALTER TABLE "courses" ADD COLUMN "level" "CourseLevel" NOT NULL DEFAULT 'ALL_LEVELS';

ALTER TABLE "courses" ADD COLUMN "priceINR" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

ALTER TABLE "courses" ADD COLUMN "salePriceINR" DECIMAL(10,2);

ALTER TABLE "courses" ADD COLUMN "totalDurationMinutes" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "courses" ADD COLUMN "certificateEnabled" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "products" ADD COLUMN "name" TEXT;

ALTER TABLE "products" ADD COLUMN "chakraAffinity" TEXT;

ALTER TABLE "products" ADD COLUMN "planetaryRuler" TEXT;

ALTER TABLE "products" ADD COLUMN "originCountry" TEXT NOT NULL DEFAULT 'India';

ALTER TABLE "products" ADD COLUMN "priceINR" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

ALTER TABLE "products" ADD COLUMN "salePriceINR" DECIMAL(10,2);

ALTER TABLE "products" ADD COLUMN "stockQuantity" INTEGER NOT NULL DEFAULT 100;

ALTER TABLE "products" ADD COLUMN "weightGrams" INTEGER;

ALTER TABLE "products" ADD COLUMN "dimensionsCm" TEXT;

ALTER TABLE "products" ADD COLUMN "activationRitualText" TEXT;

ALTER TABLE "products" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "orders" ADD COLUMN "orderNumber" TEXT;

ALTER TABLE "orders" ADD COLUMN "totalAmountINR" DECIMAL(10,2);

ALTER TABLE "orders" ADD COLUMN "discountAmountINR" DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE "orders" ADD COLUMN "shippingAmountINR" DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE "orders" ADD COLUMN "taxAmountINR" DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE "orders" ADD COLUMN "gstBreakdown" JSONB;

ALTER TABLE "orders" ADD COLUMN "paymentGateway" "PaymentGateway" DEFAULT 'EASEBUZZ_PRIMARY';

ALTER TABLE "orders" ADD COLUMN "gateway" TEXT DEFAULT 'EASEBUZZ_PRIMARY';

ALTER TABLE "orders" ADD COLUMN "gatewayOrderId" TEXT;

ALTER TABLE "orders" ADD COLUMN "gatewayPaymentId" TEXT;

ALTER TABLE "orders" ADD COLUMN "easebuzzOrderId" TEXT;

ALTER TABLE "orders" ADD COLUMN "easebuzzPaymentId" TEXT;

ALTER TABLE "orders" ADD COLUMN "billingAddress" JSONB;

ALTER TABLE "orders" ADD COLUMN "shippingCarrier" TEXT;

ALTER TABLE "orders" ADD COLUMN "customerPhone" TEXT;

ALTER TABLE "orders" ADD COLUMN "activationGuideSent" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "orders" ADD COLUMN "preSessionBriefId" TEXT;

ALTER TABLE "orders" ADD COLUMN "paidAt" TIMESTAMP(3);

ALTER TABLE "order_items" ADD COLUMN "courseId" TEXT;

ALTER TABLE "order_items" ADD COLUMN "itemType" TEXT NOT NULL DEFAULT 'PRODUCT';

ALTER TABLE "order_items" ADD COLUMN "name" TEXT;

ALTER TABLE "order_items" ADD COLUMN "unitPriceINR" DECIMAL(10,2);

ALTER TABLE "order_items" ADD COLUMN "totalPriceINR" DECIMAL(10,2);

ALTER TABLE "consents" ADD COLUMN "ipAddress" TEXT;

ALTER TABLE "consents" ADD COLUMN "userAgent" TEXT;

ALTER TABLE "events" ADD COLUMN "ipAddress" TEXT;

ALTER TABLE "events" ADD COLUMN "userAgent" TEXT;

ALTER TABLE "daily_doses" ADD COLUMN "slug" TEXT;

ALTER TABLE "daily_doses" ADD COLUMN "chakra" TEXT;

ALTER TABLE "daily_doses" ADD COLUMN "audioUrl" TEXT;

ALTER TABLE "daily_doses" ADD COLUMN "scheduledFor" TIMESTAMP(3);


-- 3b) UNIQUE INDEXES FOR NEW UNIQUE COLUMNS

CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

CREATE UNIQUE INDEX "orders_gatewayOrderId_key" ON "orders"("gatewayOrderId");

CREATE UNIQUE INDEX "orders_easebuzzOrderId_key" ON "orders"("easebuzzOrderId");

CREATE UNIQUE INDEX "daily_doses_slug_key" ON "daily_doses"("slug");
