-- AlterTable
ALTER TABLE `payee` ADD COLUMN `isSystem` BOOLEAN NOT NULL DEFAULT false;

-- Mark existing "Starting Balance" payees as system payees
UPDATE `payee` SET `isSystem` = true WHERE `name` = 'Starting Balance';
