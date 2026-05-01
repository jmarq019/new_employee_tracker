INSERT INTO departments (name)
VALUES ("sales"),
        ("dev ops"),
        ("customer support"),
        ("marketing"),
        ("product");

INSERT INTO roles (title, salary, department_id)
VALUES ("sales manager", 50000, 1),
        ("dev manager", 60000, 2),
        ("support manager", 30000, 3),
        ("marketing manager", 50000, 4),
        ("product manager", 40000, 5),
        ("sales associate", 20000, 1),
        ("junior dev", 30000, 2),
        ("support associate", 10000, 3),
        ("marketing associate", 30000, 4),
        ("product associate", 30000, 5);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Marta", "Martínez", 1, null),
        ("María del Pilar", "Hernández", 2, null),
        ("Sebastián", "Ruiz", 3, null),
        ("Guille", "Lara", 4, null),
        ("Marco Antonio", "Arevalo", 5, null),
        ("Orellana", "Campos", 6, 1),
        ("Yurisleidis", "Rodríguez", 7, 2),
        ("Joshua", "Lozano", 8, 3),
        ("Ferdinando", "Suárez", 9, 4),
        ("Karla Iberia", "Sánchez", 10, 5);