module.exports.createUsersTableQuery = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        Fname NVARCHAR(25),
        Lname NVARCHAR(25),
        DOB DATE,
        Email NVARCHAR(50),
        Password NVARCHAR(MAX),
        EntryTime DATETIME DEFAULT GETDATE()
    );
END;
`;
