/*
  Warnings:

  - You are about to drop the column `budgeted` on the `subcategory` table. All the data in the column will be lost.
  - You are about to drop the column `spent` on the `subcategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `subcategory` DROP COLUMN `budgeted`,
    DROP COLUMN `spent`;

-- CreateTable
CREATE TABLE `SubCategoryPeriod` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `periodId` INTEGER NOT NULL,
    `subCategoryId` INTEGER NOT NULL,
    `budgeted` DOUBLE NOT NULL DEFAULT 0,
    `spent` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SubCategoryPeriod_subCategoryId_periodId_idx`(`subCategoryId`, `periodId`),
    UNIQUE INDEX `SubCategoryPeriod_periodId_subCategoryId_key`(`periodId`, `subCategoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SubCategoryPeriod` ADD CONSTRAINT `SubCategoryPeriod_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `Period`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubCategoryPeriod` ADD CONSTRAINT `SubCategoryPeriod_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `SubCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
