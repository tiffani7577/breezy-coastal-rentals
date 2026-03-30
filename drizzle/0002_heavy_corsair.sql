CREATE TABLE `booking_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`senderRole` enum('admin','guest') NOT NULL,
	`senderName` varchar(128) NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `booking_messages_id` PRIMARY KEY(`id`)
);
