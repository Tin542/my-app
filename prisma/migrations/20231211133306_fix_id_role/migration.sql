BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[User_Role] DROP CONSTRAINT [User_Role_rid_fkey];

-- RedefineTables
BEGIN TRANSACTION;
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'Role'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_Role] (
    [role_id] INT NOT NULL,
    [role_name] NVARCHAR(1000) NOT NULL,
    [create_date] DATETIME2 NOT NULL,
    [update_date] DATETIME2 NOT NULL,
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([role_id])
);
IF EXISTS(SELECT * FROM [dbo].[Role])
    EXEC('INSERT INTO [dbo].[_prisma_new_Role] ([create_date],[role_id],[role_name],[update_date]) SELECT [create_date],[role_id],[role_name],[update_date] FROM [dbo].[Role] WITH (holdlock tablockx)');
DROP TABLE [dbo].[Role];
EXEC SP_RENAME N'dbo._prisma_new_Role', N'Role';
COMMIT;

-- AddForeignKey
ALTER TABLE [dbo].[User_Role] ADD CONSTRAINT [User_Role_rid_fkey] FOREIGN KEY ([rid]) REFERENCES [dbo].[Role]([role_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
