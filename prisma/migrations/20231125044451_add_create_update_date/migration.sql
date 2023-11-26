/*
  Warnings:

  - Added the required column `create_date` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `update_date` to the `User` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[User] ADD [create_date] DATETIME2 NOT NULL,
[update_date] DATETIME2 NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
