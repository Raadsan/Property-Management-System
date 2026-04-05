/*
  Warnings:

  - You are about to drop the column `canApprove` on the `RoleMenuAccess` table. All the data in the column will be lost.
  - You are about to drop the column `canAssign` on the `RoleMenuAccess` table. All the data in the column will be lost.
  - You are about to drop the column `canGenerate` on the `RoleMenuAccess` table. All the data in the column will be lost.
  - You are about to drop the column `canLost` on the `RoleMenuAccess` table. All the data in the column will be lost.
  - You are about to drop the column `canApprove` on the `RoleSubMenuAccess` table. All the data in the column will be lost.
  - You are about to drop the column `canAssign` on the `RoleSubMenuAccess` table. All the data in the column will be lost.
  - You are about to drop the column `canGenerate` on the `RoleSubMenuAccess` table. All the data in the column will be lost.
  - You are about to drop the column `canLost` on the `RoleSubMenuAccess` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `RoleMenuAccess` DROP COLUMN `canApprove`,
    DROP COLUMN `canAssign`,
    DROP COLUMN `canGenerate`,
    DROP COLUMN `canLost`;

-- AlterTable
ALTER TABLE `RoleSubMenuAccess` DROP COLUMN `canApprove`,
    DROP COLUMN `canAssign`,
    DROP COLUMN `canGenerate`,
    DROP COLUMN `canLost`;
