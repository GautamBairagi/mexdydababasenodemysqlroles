CREATE TABLE room_activity (
id INT AUTO_INCREMENT PRIMARY KEY,
workspace_id INT NOT NULL,
user_id INT NOT NULL,
client_id INT NOT NULL,
task VARCHAR(255) NOT NULL,
comments TEXT,
status INT NOT NULL,
message TEXT,
maintain_status INT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
completed_at TIMESTAMP NULL,
assign_from INT NOT NULL, -- This could represent the user assigning the task
assign_to INT NOT NULL -- This could represent the user the task is assigned to
);

CREATE TABLE status (
id INT AUTO_INCREMENT PRIMARY KEY,
workspace_id INT NOT NULL,
name VARCHAR(255) NOT NULL,
description TEXT,
note TEXT,
status INT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE routine (
id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for each record
medicine_name VARCHAR(255) NOT NULL, -- Name of the medicine
rxnumber VARCHAR(50) NOT NULL, -- Prescription number
frequency VARCHAR(50) NOT NULL, -- Frequency (e.g., "daily", "twice a day")
unit VARCHAR(50) NOT NULL, -- Unit (e.g., "mg", "ml")
time TIME NOT NULL, -- Time to take the medicine
client_id INT NOT NULL,
mfg_date DATE NOT NULL, -- Manufacturing date of the medicine
expiry_date DATE NOT NULL, -- Expiry date of the medicine
routine_start_date DATE NOT NULL, -- Start date of the routine
routine_end_date DATE NOT NULL, -- End date of the routine
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for when the record is created
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp for when the record is updated
);

CREATE TABLE medicine (
id INT PRIMARY KEY AUTO_INCREMENT,
medicine_name VARCHAR(255) NOT NULL,
medicine_restrictions TEXT,
allergies TEXT,
precautions TEXT,
user_ids TEXT,
allotted_to INT,
allotted_from INT,
mfg_date DATE,
expiry_date DATE,
qty INT ,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
update_id INT
);

CREATE TABLE comments_activity (
    id SERIAL PRIMARY KEY, -- Unique identifier for each comment
    workspace_id INT NOT NULL, -- ID of the associated workspace
    user_id INT NOT NULL, -- ID of the user who made the comment
    status VARCHAR(50) NOT NULL, -- Status of the comment (e.g., active, resolved)
    message TEXT NOT NULL, -- The comment text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp of the last update
);

CREATE TABLE medicine_activity (
    id SERIAL PRIMARY KEY, -- Unique identifier for each comment
    workspace_id INT NOT NULL, -- ID of the associated workspace
    user_id INT NOT NULL, -- ID of the user who made the comment
    status VARCHAR(50) NOT NULL, -- Status of the comment (e.g., active, resolved)
    message TEXT NOT NULL, -- The comment text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp of the last update
);

CREATE TABLE milestone_activity (
    id SERIAL PRIMARY KEY, -- Unique identifier for each comment
    workspace_id INT NOT NULL, -- ID of the associated workspace
    user_id INT NOT NULL, -- ID of the user who made the comment
    status VARCHAR(50) NOT NULL, -- Status of the comment (e.g., active, resolved)
    message TEXT NOT NULL, -- The comment text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp of the last update
);

CREATE TABLE routine_activity (
    id SERIAL PRIMARY KEY, -- Unique identifier for each comment
    workspace_id INT NOT NULL, -- ID of the associated workspace
    user_id INT NOT NULL, -- ID of the user who made the comment
    status VARCHAR(50) NOT NULL, -- Status of the comment (e.g., active, resolved)
    message TEXT NOT NULL, -- The comment text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp of the last update
);

CREATE TABLE task_activity (
    id SERIAL PRIMARY KEY, -- Unique identifier for each comment
    workspace_id INT NOT NULL, -- ID of the associated workspace
    user_id INT NOT NULL, -- ID of the user who made the comment
    status VARCHAR(50) NOT NULL, -- Status of the comment (e.g., active, resolved)
    message TEXT NOT NULL, -- The comment text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp of the last update
);


CREATE TABLE setting_activity (
    id SERIAL PRIMARY KEY, -- Unique identifier for each comment
    workspace_id INT NOT NULL, -- ID of the associated workspace
    user_id INT NOT NULL, -- ID of the user who made the comment
    status VARCHAR(50) NOT NULL, -- Status of the comment (e.g., active, resolved)
    message TEXT NOT NULL, -- The comment text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp of the last update
);

CREATE TABLE status_activity (
    id SERIAL PRIMARY KEY, -- Unique identifier for each comment
    workspace_id INT NOT NULL, -- ID of the associated workspace
    user_id INT NOT NULL, -- ID of the user who made the comment
    status VARCHAR(50) NOT NULL, -- Status of the comment (e.g., active, resolved)
    message TEXT NOT NULL, -- The comment text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp of the last update
);

CREATE TABLE users_activity (
    id SERIAL PRIMARY KEY, -- Unique identifier for each comment
    workspace_id INT NOT NULL, -- ID of the associated workspace
    user_id INT NOT NULL, -- ID of the user who made the comment
    status VARCHAR(50) NOT NULL, -- Status of the comment (e.g., active, resolved)
    message TEXT NOT NULL, -- The comment text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp of the last update
);