const createUsersTableQuery = (CGUID = 'docker') => {
    return `
    USE ${CGUID}; -- Specify the database to use
    
    -- Check if the Users table exists
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Users' AND xtype = 'U')
    BEGIN
        CREATE TABLE ${CGUID}.dbo.Users ( -- Fully qualify the table name
            UserId INT IDENTITY(1,1) PRIMARY KEY,
            Fname NVARCHAR(25),
            Lname NVARCHAR(25),
            DOB DATE,
            Email NVARCHAR(50),
            Password NVARCHAR(MAX),
            EntryTime DATETIME DEFAULT GETDATE()
        );
    END;
    
    -- Check and add columns if they do not exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'UserId')
    BEGIN
        ALTER TABLE ${CGUID}.dbo.Users ADD UserId INT IDENTITY(1,1) PRIMARY KEY;
    END;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'Fname')
    BEGIN
        ALTER TABLE ${CGUID}.dbo.Users ADD Fname NVARCHAR(25);
    END;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'Lname')
    BEGIN
        ALTER TABLE ${CGUID}.dbo.Users ADD Lname NVARCHAR(25);
    END;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'DOB')
    BEGIN
        ALTER TABLE ${CGUID}.dbo.Users ADD DOB DATE;
    END;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'Email')
    BEGIN
        ALTER TABLE ${CGUID}.dbo.Users ADD Email NVARCHAR(50);
    END;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'Password')
    BEGIN
        ALTER TABLE ${CGUID}.dbo.Users ADD Password NVARCHAR(MAX);
    END;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'EntryTime')
    BEGIN
        ALTER TABLE ${CGUID}.dbo.Users ADD EntryTime DATETIME DEFAULT GETDATE();
    END;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'UUID')
    BEGIN
        ALTER TABLE ${CGUID}.dbo.Users ADD UUID UNIQUEIDENTIFIER DEFAULT NEWID();
    END;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'CGUID')
    BEGIN
        ALTER TABLE ${CGUID}.dbo.Users ADD CGUID NVARCHAR(100) UNIQUEIDENTIFIER;
    END;
    `;
}

module.exports = {
    createUsersTableQuery
}