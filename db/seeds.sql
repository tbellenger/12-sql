USE cms;

INSERT INTO department (name)
VALUES
  ('Sales'),
  ('Legal'),
  ('Engineering'),
  ('Finance');

INSERT INTO  role (title, salary, department_id) VALUES
    ('Salesperson', 80000, 1),
    ('Lead Engineer', 150000, 3),
    ('Software Engineer', 120000, 3),
    ('Account Manager', 140000, 4),
    ('Accountant', 125000, 4),
    ('Legal Team Lead', 250000, 2),
    ('Lawyer', 190000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Smith', 1, null),
('George', 'Jensen', 2, null),
('Sofi', 'Tukker', 3, 2),
('Alison', 'Chan', 4, null),
('Tim', 'Howard', 5, 4);