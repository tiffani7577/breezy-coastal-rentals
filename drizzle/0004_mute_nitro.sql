ALTER TABLE `bookings` MODIFY COLUMN `airbnbBookingName` varchar(128);--> statement-breakpoint
ALTER TABLE `pricing` MODIFY COLUMN `dailyRate` decimal(10,2) NOT NULL DEFAULT '170.00';