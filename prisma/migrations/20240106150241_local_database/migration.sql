BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [user_id] INT NOT NULL IDENTITY(1,1),
    [full_name] NVARCHAR(1000) NOT NULL,
    [username] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [score] INT NOT NULL,
    [create_date] DATETIME2 NOT NULL,
    [update_date] DATETIME2 NOT NULL,
    [refresh_token] NVARCHAR(1000),
    [isActived] BIT,
    [isDeleted] BIT,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([user_id]),
    CONSTRAINT [User_username_key] UNIQUE NONCLUSTERED ([username])
);

-- CreateTable
CREATE TABLE [dbo].[Role] (
    [role_id] INT NOT NULL,
    [role_name] NVARCHAR(1000) NOT NULL,
    [create_date] DATETIME2 NOT NULL,
    [update_date] DATETIME2 NOT NULL,
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([role_id])
);

-- CreateTable
CREATE TABLE [dbo].[User_Role] (
    [uid] INT NOT NULL,
    [rid] INT NOT NULL,
    [create_date] DATETIME2 NOT NULL,
    [update_date] DATETIME2 NOT NULL,
    CONSTRAINT [User_Role_pkey] PRIMARY KEY CLUSTERED ([uid],[rid])
);

-- AddForeignKey
ALTER TABLE [dbo].[User_Role] ADD CONSTRAINT [User_Role_uid_fkey] FOREIGN KEY ([uid]) REFERENCES [dbo].[User]([user_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

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
