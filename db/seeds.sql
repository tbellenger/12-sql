INSERT INTO department (name)
VALUES
  ('Sales'),
  ('Legal'),
  ('Engineering'),
  ('Finance');


INSERT INTO  role (title, salary, department_id)
VALUES
    ('Salesperson', 80000, 1),
    ('Lead Engineer', 150000, 3),
    ('Software Engineer', 120000, 3),
    ('Account Manager', 140000, 4),
    ('Accountant', 125000, 4),
    ('Legal Team Lead', 250000, 2),
    ('Lawyer', 190000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('John', 'Smith', 1, null),
('George', 'Jensen', 2, null),
('Sofi', 'Tukker', 3, 2),
('Alison', 'Chan', 4, null),
('Tim', 'Howard', 5, 4);


SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(manager.first_name,' ', manager.last_name) as manager FROM 
employee 
LEFT JOIN role ON employee.role_id = role.id 
LEFT JOIN department ON role.department_id = department.id
LEFT JOIN employee AS manager ON employee.manager_id = manager.id;