CREATE TABLE SUser (
    
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    name VARCHAR(80) NOT NULL,
    userType ENUM('MANAGER','TECHNICIAN') NOT NULL,
    INDEX(username)
    
);

CREATE TABLE Task (
    
    id INT PRIMARY KEY AUTO_INCREMENT,
    summary VARCHAR(2500) NOT NULL,
    completionDate DATETIME,
    userId INT,

    FOREIGN KEY(userId) REFERENCES SUser(id) ON DELETE SET NULL ON UPDATE CASCADE
    
);

DELIMITER $$

CREATE FUNCTION isTechnician(techId INT) RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE lUserType VARCHAR(15);
    DECLARE result BOOLEAN;
    SELECT userType INTO lUserType FROM SUser WHERE id=techId;
    
    IF (lUsertype = 'TECHNICIAN') THEN
        SET result = TRUE;
    ELSE
        SET result = FALSE;

    END IF;

    RETURN result;
END
$$

CREATE TRIGGER TaskTechnician BEFORE INSERT ON Task

    FOR EACH ROW
    BEGIN
        IF NOT isTechnician(New.userId) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = "Tasks can't be assigned to managers", MYSQL_ERRNO = 1000;
        END IF;
    END
$$

DELIMITER ;

-- Other way to implement inheritance and without the need of the trigger was to create two different tables, 
-- one for manager and another for technician and link tasks only with technicians. 
-- But then for every select on user table a join would have been necessary to determine the type of user

-- CREATE TABLE Manager (
--     id PRIMARY KEY,
--     FOREIGN KEY(id) REFERENCES SUser(id) ON DELETE CASCADE ON UPDATE CASCADE
-- );

-- CREATE TABLE Technician (
--     id PRIMARY KEY,
--     FOREIGN KEY(id) REFERENCES SUser(id) ON DELETE CASCADE ON UPDATE CASCADE
-- );

-- CREATE TABLE Task (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     summary VARCHAR(2500) NOT NULL,
--     userId INT,
--     FOREIGN KEY(userId) REFERENCES Technician(id) ON DELETE SET NULL ON UPDATE CASCADE
-- );


INSERT INTO SUser(username,password,name,userType) VALUES('manager1','$2a$10$e6GeSZSOiQJ.VBsd2EQkWO4xMNI89nTsk2Lj9tlKTnMIAgJ90Ofje','Manager 1','MANAGER');
INSERT INTO SUser(username,password,name,userType) VALUES('manager2','$2a$10$e6GeSZSOiQJ.VBsd2EQkWO4xMNI89nTsk2Lj9tlKTnMIAgJ90Ofje','Manager 2','MANAGER');
INSERT INTO SUser(username,password,name,userType) VALUES('tech1','$2a$10$e6GeSZSOiQJ.VBsd2EQkWO4xMNI89nTsk2Lj9tlKTnMIAgJ90Ofje','Tech 1','TECHNICIAN');
INSERT INTO SUser(username,password,name,userType) VALUES('tech2','$2a$10$e6GeSZSOiQJ.VBsd2EQkWO4xMNI89nTsk2Lj9tlKTnMIAgJ90Ofje','Tech 2','TECHNICIAN');
INSERT INTO SUser(username,password,name,userType) VALUES('tech3','$2a$10$e6GeSZSOiQJ.VBsd2EQkWO4xMNI89nTsk2Lj9tlKTnMIAgJ90Ofje','Tech 3','TECHNICIAN');
INSERT INTO SUser(username,password,name,userType) VALUES('tech4','$2a$10$e6GeSZSOiQJ.VBsd2EQkWO4xMNI89nTsk2Lj9tlKTnMIAgJ90Ofje','Tech 4','TECHNICIAN');