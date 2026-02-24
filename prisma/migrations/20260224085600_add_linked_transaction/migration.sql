-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `linkedTransactionId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Transaction_linkedTransactionId_key` ON `Transaction`(`linkedTransactionId`);

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_linkedTransactionId_fkey` FOREIGN KEY (`linkedTransactionId`) REFERENCES `Transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
