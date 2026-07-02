PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_payment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`publicId` text NOT NULL,
	`userId` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`planId` text NOT NULL,
	`provider` text NOT NULL,
	`providerTransactionId` text,
	`providerSessionId` text,
	`type` text NOT NULL,
	`creditsAmount` integer NOT NULL,
	`status` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
INSERT INTO `__new_payment` (
	`id`,
	`publicId`,
	`userId`,
	`amount`,
	`currency`,
	`planId`,
	`provider`,
	`providerTransactionId`,
	`providerSessionId`,
	`type`,
	`creditsAmount`,
	`status`,
	`createdAt`,
	`updatedAt`
)
SELECT
	`id`,
	'pay_' || lower(hex(randomblob(16))),
	`userId`,
	`amount`,
	`currency`,
	`planId`,
	`provider`,
	`providerTransactionId`,
	`providerSessionId`,
	`type`,
	`creditsAmount`,
	`status`,
	`createdAt`,
	`updatedAt`
FROM `payment`;--> statement-breakpoint
DROP TABLE `payment`;--> statement-breakpoint
ALTER TABLE `__new_payment` RENAME TO `payment`;--> statement-breakpoint
CREATE UNIQUE INDEX `payment_publicId_unique` ON `payment` (`publicId`);--> statement-breakpoint
CREATE INDEX `payment_publicId_idx` ON `payment` (`publicId`);--> statement-breakpoint
CREATE INDEX `payment_userId_idx` ON `payment` (`userId`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
