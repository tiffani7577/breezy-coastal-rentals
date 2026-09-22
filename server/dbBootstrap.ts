import type { Pool } from "mysql2/promise";

/**
 * The production service owns the minimum schema required to accept bookings.
 * Every statement is idempotent so concurrent serverless cold starts can safely
 * recover a new or partially initialized TiDB/MySQL database.
 */
const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`openId\` varchar(64) NOT NULL,
    \`name\` text,
    \`email\` varchar(320),
    \`loginMethod\` varchar(64),
    \`role\` enum('user','admin') NOT NULL DEFAULT 'user',
    \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    \`lastSignedIn\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`users_openId_unique\` (\`openId\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`pricing\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`dailyRate\` decimal(10,2) NOT NULL DEFAULT '160.00',
    \`deliveryFee\` decimal(10,2) NOT NULL DEFAULT '0.00',
    \`cartName\` varchar(128) NOT NULL DEFAULT 'Breezy Golf Cart',
    \`cartDescription\` text,
    \`cartImageUrl\` text,
    \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`availability_blocks\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`blockDate\` date NOT NULL,
    \`reason\` varchar(255),
    \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`bookings\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`bookingRef\` varchar(16) NOT NULL,
    \`guestName\` varchar(128) NOT NULL,
    \`guestEmail\` varchar(320) NOT NULL,
    \`guestPhone\` varchar(32) NOT NULL,
    \`airbnbBookingName\` varchar(128),
    \`startDate\` date NOT NULL,
    \`endDate\` date NOT NULL,
    \`totalDays\` int NOT NULL,
    \`dailyRate\` decimal(10,2) NOT NULL,
    \`deliveryFee\` decimal(10,2) NOT NULL DEFAULT '0.00',
    \`totalAmount\` decimal(10,2) NOT NULL,
    \`bookingStatus\` enum('pending_payment','submitted','under_review','approved','rejected','completed','cancelled') NOT NULL DEFAULT 'pending_payment',
    \`documentStatus\` enum('pending','received','needs_update','approved') NOT NULL DEFAULT 'pending',
    \`adminNotes\` text,
    \`rejectionReason\` text,
    \`stripeSessionId\` varchar(256),
    \`stripePaymentIntentId\` varchar(256),
    \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    \`paidAt\` timestamp NULL,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`bookings_bookingRef_unique\` (\`bookingRef\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`documents\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`bookingId\` int NOT NULL,
    \`documentType\` enum('drivers_license','proof_of_insurance') NOT NULL,
    \`fileKey\` varchar(512) NOT NULL,
    \`fileUrl\` text NOT NULL,
    \`fileName\` varchar(256),
    \`mimeType\` varchar(64),
    \`fileSize\` bigint,
    \`uploadedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`waiver_signatures\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`bookingId\` int NOT NULL,
    \`legalName\` varchar(256) NOT NULL,
    \`agreedToTerms\` boolean NOT NULL DEFAULT false,
    \`ipAddress\` varchar(64),
    \`userAgent\` text,
    \`signedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`booking_messages\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`bookingId\` int NOT NULL,
    \`senderRole\` enum('admin','guest') NOT NULL,
    \`senderName\` varchar(128) NOT NULL,
    \`content\` text NOT NULL,
    \`isRead\` boolean NOT NULL DEFAULT false,
    \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`inspection_checklists\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`bookingId\` int NOT NULL,
    \`completedBy\` varchar(128) NOT NULL,
    \`batteryCharged\` boolean NOT NULL DEFAULT false,
    \`tiresInflated\` boolean NOT NULL DEFAULT false,
    \`brakesWorking\` boolean NOT NULL DEFAULT false,
    \`steeringWorking\` boolean NOT NULL DEFAULT false,
    \`signalLightsWorking\` boolean NOT NULL DEFAULT false,
    \`brakeLightsWorking\` boolean NOT NULL DEFAULT false,
    \`headlightsWorking\` boolean NOT NULL DEFAULT false,
    \`bodyFrameOk\` boolean NOT NULL DEFAULT false,
    \`seatbeltsOk\` boolean NOT NULL DEFAULT false,
    \`cleanAndReady\` boolean NOT NULL DEFAULT false,
    \`notes\` text,
    \`completedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`inspection_checklists_bookingId_unique\` (\`bookingId\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`sms_notifications\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`bookingId\` int NOT NULL,
    \`notificationType\` enum('approval_confirmation','reminder_24h') NOT NULL,
    \`phoneNumber\` varchar(32) NOT NULL,
    \`messageContent\` text NOT NULL,
    \`sentAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`status\` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
    \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`inspection_photos\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`bookingId\` int NOT NULL,
    \`photoType\` enum('before','after') NOT NULL,
    \`photoUrl\` text NOT NULL,
    \`fileKey\` varchar(255) NOT NULL,
    \`uploadedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  )`,
] as const;

const PRICING_SEED_STATEMENT = `
  INSERT INTO \`pricing\` (\`id\`, \`dailyRate\`, \`deliveryFee\`, \`cartName\`)
  VALUES (1, '160.00', '0.00', 'Breezy Golf Cart')
  ON DUPLICATE KEY UPDATE \`id\` = \`id\`
`;

let schemaBootstrapPromise: Promise<void> | null = null;

export function getSchemaStatements(): readonly string[] {
  return SCHEMA_STATEMENTS;
}

export async function ensureDatabaseSchema(pool: Pick<Pool, "query">): Promise<void> {
  if (!schemaBootstrapPromise) {
    schemaBootstrapPromise = (async () => {
      for (const statement of SCHEMA_STATEMENTS) {
        await pool.query(statement);
      }
      await pool.query(PRICING_SEED_STATEMENT);
    })().catch((error) => {
      schemaBootstrapPromise = null;
      throw error;
    });
  }

  return schemaBootstrapPromise;
}
