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
        ("markeint associate", 30000, 4),
        ("product associate", 30000, 5);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("joe", "dirt", 1, null),
        ("lapili", "pilar", 2, null),
        ("marissa", "monte", 3, null),
        ("larissa", "lara", 4, null),
        ("paul", "paulson", 5, null),
        ("jesse", "price", 6, 1),
        ("corona", "virus", 7, 2),
        ("lavense", "lasmanos", 8, 3),
        ("haganlo", "seguido", 9, 4),
        ("virus", "corona", 10, 5);