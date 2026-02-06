-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_subCatId_fkey`;

-- AlterTable
ALTER TABLE `transaction` MODIFY `subCatId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_subCatId_fkey` FOREIGN KEY (`subCatId`) REFERENCES `SubCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
