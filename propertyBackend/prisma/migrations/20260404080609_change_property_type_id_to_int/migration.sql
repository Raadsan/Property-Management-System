/*
  Warnings:

  - You are about to alter the column `propertyTypeId` on the `Property` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `PropertyType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `PropertyType` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `Property` DROP FOREIGN KEY `Property_propertyTypeId_fkey`;

-- AlterTable
ALTER TABLE `Property` MODIFY `propertyTypeId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `PropertyType` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_propertyTypeId_fkey` FOREIGN KEY (`propertyTypeId`) REFERENCES `PropertyType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
