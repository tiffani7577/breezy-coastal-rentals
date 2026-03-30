CREATE TABLE `availability_blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blockDate` date NOT NULL,
	`reason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `availability_blocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingRef` varchar(16) NOT NULL,
	`guestName` varchar(128) NOT NULL,
	`guestEmail` varchar(320) NOT NULL,
	`guestPhone` varchar(32) NOT NULL,
	`airbnbBookingName` varchar(128) NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`totalDays` int NOT NULL,
	`dailyRate` decimal(10,2) NOT NULL,
	`deliveryFee` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalAmount` decimal(10,2) NOT NULL,
	`bookingStatus` enum('pending_payment','submitted','under_review','approved','rejected','completed','cancelled') NOT NULL DEFAULT 'pending_payment',
	`documentStatus` enum('pending','received','needs_update','approved') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`rejectionReason` text,
	`stripeSessionId` varchar(256),
	`stripePaymentIntentId` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`paidAt` timestamp,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookings_bookingRef_unique` UNIQUE(`bookingRef`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`documentType` enum('drivers_license','proof_of_insurance') NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileName` varchar(256),
	`mimeType` varchar(64),
	`fileSize` bigint,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dailyRate` decimal(10,2) NOT NULL DEFAULT '89.00',
	`deliveryFee` decimal(10,2) NOT NULL DEFAULT '0.00',
	`cartName` varchar(128) NOT NULL DEFAULT 'Breezy Golf Cart',
	`cartDescription` text,
	`cartImageUrl` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waiver_signatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`legalName` varchar(256) NOT NULL,
	`agreedToTerms` boolean NOT NULL DEFAULT false,
	`ipAddress` varchar(64),
	`userAgent` text,
	`signedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waiver_signatures_id` PRIMARY KEY(`id`)
);
