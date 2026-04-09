/*
  Warnings:

  - You are about to alter the column `listingType` on the `Property` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(0))`.
  - Added the required column `city` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Booking` ALTER COLUMN `price` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Property` ADD COLUMN `area` DOUBLE NULL,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `sizeLabel` VARCHAR(191) NULL,
    MODIFY `listingType` ENUM('RENT', 'SALE') NOT NULL DEFAULT 'RENT';
