CREATE TABLE material_category (
    id_material INTEGER NOT NULL,
    id_category INTEGER NOT NULL,
    PRIMARY KEY (id_material, id_category),
    FOREIGN KEY (id_material) REFERENCES material(id) ON DELETE CASCADE,
    FOREIGN KEY (id_category) REFERENCES category(id) ON DELETE CASCADE
);
