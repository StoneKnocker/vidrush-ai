DROP TABLE `user_task`;
--> statement-breakpoint
CREATE TABLE `user_task` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`mode` text NOT NULL,
	`model` text NOT NULL,
	`provider` text DEFAULT 'kie' NOT NULL,
	`prompt` text DEFAULT '' NOT NULL,
	`input` text NOT NULL,
	`providerTaskId` text,
	`resultData` text NOT NULL,
	`errorMessage` text DEFAULT '' NOT NULL,
	`errorCode` text DEFAULT '' NOT NULL,
	`creditCost` integer DEFAULT 0 NOT NULL,
	`processingDurationMs` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`completedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_tasks_userId_createdAt_idx` ON `user_task` (`userId`,`createdAt`);
--> statement-breakpoint
CREATE INDEX `user_tasks_providerTaskId_idx` ON `user_task` (`providerTaskId`);
--> statement-breakpoint
CREATE INDEX `user_tasks_status_updatedAt_idx` ON `user_task` (`status`,`updatedAt`);
