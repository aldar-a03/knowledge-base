CREATE TABLE history (
    id          SERIAL PRIMARY KEY,
    id_material INTEGER   NOT NULL,
    id_user     INTEGER   NOT NULL,
    change_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_material) REFERENCES material(id) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
);