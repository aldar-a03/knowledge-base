CREATE TABLE comment (
    id          SERIAL   PRIMARY KEY,
    id_user     INTEGER      NOT NULL,
    id_material INTEGER      NOT NULL,
    text        VARCHAR(140) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_material) REFERENCES material(id) ON DELETE CASCADE
);
