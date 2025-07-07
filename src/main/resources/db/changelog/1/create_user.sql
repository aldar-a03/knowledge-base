CREATE TABLE users
(
    id           SERIAL PRIMARY KEY,
    full_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(100) NOT NULL,
    user_role    VARCHAR(50)  NOT NULL,
    time_insert  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);