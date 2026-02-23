-- Step 1: Insert distinct payees per user into the Payee table
-- (skip any that already exist from the previous migration)
INSERT IGNORE INTO `Payee` (`name`, `userId`)
SELECT DISTINCT t.`payee`, at2.`userId`
FROM `Transaction` t
JOIN `AccountType` at2 ON t.`accountTypeId` = at2.`id`
WHERE t.`payee` IS NOT NULL AND t.`payee` != '';

-- Step 2: Add payeeId column (nullable first so we can populate it)
ALTER TABLE `Transaction` ADD COLUMN `payeeId` INTEGER NULL;

-- Step 3: Populate payeeId from existing payee strings
UPDATE `Transaction` t
JOIN `AccountType` at2 ON t.`accountTypeId` = at2.`id`
JOIN `Payee` p ON p.`name` = t.`payee` AND p.`userId` = at2.`userId`
SET t.`payeeId` = p.`id`;

-- Step 4: Make payeeId NOT NULL
ALTER TABLE `Transaction` MODIFY COLUMN `payeeId` INTEGER NOT NULL;

-- Step 5: Add foreign key constraint
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_payeeId_fkey` FOREIGN KEY (`payeeId`) REFERENCES `Payee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: Create index on payeeId
CREATE INDEX `Transaction_payeeId_idx` ON `Transaction`(`payeeId`);

-- Step 7: Drop the old payee string column
ALTER TABLE `Transaction` DROP COLUMN `payee`;
