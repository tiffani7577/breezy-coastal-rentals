const mysql = require('mysql2/promise');

async function createTables() {
  const conn = await mysql.createConnection({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '3gywxKXAYem6HJF.root',
    password: 'Kdnl20aNP3lqDPZI',
    database: 'breezy_coastal_rentals',
    ssl: { rejectUnauthorized: true }
  });

  const tables = [
    [`users`, `CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`openId\` varchar(128) NOT NULL,
      \`appId\` varchar(128) NOT NULL,
      \`name\` varchar(256),
      \`email\` varchar(320),
      \`role\` enum('admin','user') NOT NULL DEFAULT 'user',
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      \`lastLoginAt\` timestamp,
      CONSTRAINT \`users_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`users_openId_unique\` UNIQUE(\`openId\`)
    )`],
    [`bookings`, `CREATE TABLE IF NOT EXISTS \`bookings\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`bookingRef\` varchar(16) NOT NULL,
      \`guestName\` varchar(128) NOT NULL,
      \`guestEmail\` varchar(320) NOT NULL,
      \`guestPhone\` varchar(32) NOT NULL,
      \`airbnbBookingName\` varchar(128) NOT NULL,
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
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      \`paidAt\` timestamp,
      CONSTRAINT \`bookings_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`bookings_bookingRef_unique\` UNIQUE(\`bookingRef\`)
    )`],
    [`pricing`, `CREATE TABLE IF NOT EXISTS \`pricing\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`dailyRate\` decimal(10,2) NOT NULL DEFAULT '170.00',
      \`deliveryFee\` decimal(10,2) NOT NULL DEFAULT '0.00',
      \`cartName\` varchar(128) NOT NULL DEFAULT 'Breezy Golf Cart',
      \`cartDescription\` text,
      \`cartImageUrl\` text,
      \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT \`pricing_id\` PRIMARY KEY(\`id\`)
    )`],
    [`documents`, `CREATE TABLE IF NOT EXISTS \`documents\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`bookingId\` int NOT NULL,
      \`documentType\` enum('drivers_license','proof_of_insurance') NOT NULL,
      \`fileKey\` varchar(512) NOT NULL,
      \`fileUrl\` text NOT NULL,
      \`fileName\` varchar(256),
      \`mimeType\` varchar(64),
      \`fileSize\` bigint,
      \`uploadedAt\` timestamp NOT NULL DEFAULT (now()),
      CONSTRAINT \`documents_id\` PRIMARY KEY(\`id\`)
    )`],
    [`waiver_signatures`, `CREATE TABLE IF NOT EXISTS \`waiver_signatures\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`bookingId\` int NOT NULL,
      \`signatureData\` text NOT NULL,
      \`signedAt\` timestamp NOT NULL DEFAULT (now()),
      \`ipAddress\` varchar(64),
      \`userAgent\` text,
      \`waiverVersion\` varchar(16) NOT NULL DEFAULT '1.0',
      CONSTRAINT \`waiver_signatures_id\` PRIMARY KEY(\`id\`)
    )`],
    [`availability_blocks`, `CREATE TABLE IF NOT EXISTS \`availability_blocks\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`startDate\` date NOT NULL,
      \`endDate\` date NOT NULL,
      \`reason\` varchar(256),
      CONSTRAINT \`availability_blocks_id\` PRIMARY KEY(\`id\`)
    )`],
    [`booking_messages`, `CREATE TABLE IF NOT EXISTS \`booking_messages\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`bookingId\` int NOT NULL,
      \`senderType\` enum('admin','guest') NOT NULL,
      \`senderName\` varchar(128),
      \`message\` text NOT NULL,
      \`isRead\` tinyint(1) NOT NULL DEFAULT 0,
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      CONSTRAINT \`booking_messages_id\` PRIMARY KEY(\`id\`)
    )`],
    [`inspection_checklists`, `CREATE TABLE IF NOT EXISTS \`inspection_checklists\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`bookingId\` int NOT NULL,
      \`inspectionType\` enum('pre_rental','post_rental') NOT NULL,
      \`frontLeftTire\` tinyint(1) NOT NULL DEFAULT 0,
      \`frontRightTire\` tinyint(1) NOT NULL DEFAULT 0,
      \`rearLeftTire\` tinyint(1) NOT NULL DEFAULT 0,
      \`rearRightTire\` tinyint(1) NOT NULL DEFAULT 0,
      \`battery\` tinyint(1) NOT NULL DEFAULT 0,
      \`brakes\` tinyint(1) NOT NULL DEFAULT 0,
      \`lights\` tinyint(1) NOT NULL DEFAULT 0,
      \`horn\` tinyint(1) NOT NULL DEFAULT 0,
      \`seatBelts\` tinyint(1) NOT NULL DEFAULT 0,
      \`bodyCondition\` tinyint(1) NOT NULL DEFAULT 0,
      \`notes\` text,
      \`completedAt\` timestamp NOT NULL DEFAULT (now()),
      \`completedBy\` varchar(128),
      CONSTRAINT \`inspection_checklists_id\` PRIMARY KEY(\`id\`)
    )`],
    [`inspection_photos`, `CREATE TABLE IF NOT EXISTS \`inspection_photos\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`checklistId\` int NOT NULL,
      \`photoType\` varchar(64) NOT NULL,
      \`fileKey\` varchar(512) NOT NULL,
      \`fileUrl\` text NOT NULL,
      \`uploadedAt\` timestamp NOT NULL DEFAULT (now()),
      CONSTRAINT \`inspection_photos_id\` PRIMARY KEY(\`id\`)
    )`],
    [`sms_notifications`, `CREATE TABLE IF NOT EXISTS \`sms_notifications\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`bookingId\` int NOT NULL,
      \`notificationType\` enum('approval_confirmation','reminder_24h','booking_received','payment_confirmed') NOT NULL,
      \`phoneNumber\` varchar(32) NOT NULL,
      \`messageContent\` text NOT NULL,
      \`sentAt\` timestamp NOT NULL DEFAULT (now()),
      \`status\` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      CONSTRAINT \`sms_notifications_id\` PRIMARY KEY(\`id\`)
    )`]
  ];

  for (const [name, sql] of tables) {
    try {
      await conn.execute(sql);
      console.log('Created:', name);
    } catch(e) {
      console.log('Error on', name, ':', e.message.substring(0, 100));
    }
  }

  // Insert default pricing row
  try {
    await conn.execute('INSERT IGNORE INTO `pricing` (`id`) VALUES (1)');
    console.log('Default pricing row inserted');
  } catch(e) {
    console.log('Pricing insert error:', e.message);
  }

  await conn.end();
  console.log('All done!');
}
createTables().catch(console.error);
