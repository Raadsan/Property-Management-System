/*
  Warnings:

  - You are about to drop the column `leaseId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `saleId` on the `Payment` table. All the data in the column will be lost.
  - You are about to alter the column `listingType` on the `Property` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(0))`.
  - The values [RENTED,SOLD] on the enum `Property_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Lease` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sale` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Lease` DROP FOREIGN KEY `Lease_propertyId_fkey`;

-- DropForeignKey
ALTER TABLE `Lease` DROP FOREIGN KEY `Lease_tenantId_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_leaseId_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_saleId_fkey`;

-- DropForeignKey
ALTER TABLE `Sale` DROP FOREIGN KEY `Sale_buyerId_fkey`;

-- DropForeignKey
ALTER TABLE `Sale` DROP FOREIGN KEY `Sale_propertyId_fkey`;

-- DropIndex
DROP INDEX `Payment_leaseId_fkey` ON `Payment`;

-- DropIndex
DROP INDEX `Payment_saleId_fkey` ON `Payment`;

-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `leaseId`,
    DROP COLUMN `saleId`,
    ADD COLUMN `bookingId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Property` MODIFY `listingType` ENUM('BOOKING') NOT NULL DEFAULT 'BOOKING',
    MODIFY `status` ENUM('AVAILABLE', 'BOOKED') NOT NULL DEFAULT 'AVAILABLE';

-- DropTable
DROP TABLE `Lease`;

-- DropTable
DROP TABLE `Sale`;

-- CreateTable
CREATE TABLE `Booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `propertyId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 100,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Booking_propertyId_fkey`(`propertyId`),
    INDEX `Booking_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Payment_bookingId_fkey` ON `Payment`(`bookingId`);

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
