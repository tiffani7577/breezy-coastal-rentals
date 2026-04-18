CREATE TABLE `inspection_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`photoType` enum('before','after') NOT NULL,
	`photoUrl` text NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inspection_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sms_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`notificationType` enum('approval_confirmation','reminder_24h') NOT NULL,
	`phoneNumber` varchar(32) NOT NULL,
	`messageContent` text NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sms_notifications_id` PRIMARY KEY(`id`)
);
