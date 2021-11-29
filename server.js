const dotenv = require('dotenv').config();
const inquirer = require('inquirer');
const mysql2 = require('mysql2/promise');
const contable = require('console.table');

let connection;
async function database() {
    try {
        connection = await mysql2.createConnection({
            host: 'localhost',
            user: 'admin',
            password: process.env.DB_PASSWORD,
            database: 'cms'
        });
    } catch (err) {
        console.log(err);
    }
}

const menu = [
    {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role', 'quit']
    }
]

const init = async () => {
    if (!connection) {
        await database();
    }
    const answer = await inquirer.prompt(menu);
    if (answer.action == 'quit') {
        connection.destroy();
        process.exit(0);
    } else {
        if (answer.action == 'view all departments') {
            // display all the departments
            const [results, fields] = await connection.execute('SELECT * FROM department');
            console.table(results);
            console.log('\n');
        } else if (answer.action == 'view all roles') {
            // display all the roles - join on the department to get the department name
            const [results, fields] = await connection.execute('SELECT role.id, role.title, role.salary, department.name AS dept FROM role LEFT JOIN department on role.department_id = department.id');
            console.table(results);
            console.log('\n');
        } else if (answer.action == 'view all employees') {
            // display all the employess - join on the role to get title and salary and department to get department name
            const [results, fields] = await connection.execute(`SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(manager.first_name,' ', manager.last_name) as manager FROM 
            employee 
            LEFT JOIN role ON employee.role_id = role.id 
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee AS manager ON employee.manager_id = manager.id`);
            console.table(results);
            console.log('\n');
        } else if (answer.action == 'add a department') {
            // Get a new department name and insert in the database
            const deptAnswer = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'newDeptName',
                    message: 'What is the new department name?'
                }
            ]);
            const [results, fields] = await connection.execute('INSERT INTO department (name) VALUE (\'' + deptAnswer.newDeptName + '\')');
            console.log(`Added ${deptAnswer.newDeptName} to the database`);
        } else if (answer.action == 'add a role') {
            // Get a new role name and insert in the database
            const [results, fields] = await connection.execute('SELECT * FROM department');
            const depts = Array.from(results, x => x.name);
            const roleAnswer = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'newRoleName',
                    message: 'What is the new role name?'
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'What is the salary for the new role?'
                },
                {
                    type: 'list',
                    name: 'department',
                    message: 'What department is this role attached to?',
                    choices: depts
                }
            ]);
            const deptId = results.find(element => element.name == roleAnswer.department);
            const [newRoleResult, newRoleFields] = await connection.execute(`INSERT INTO role (title, salary, department_id) VALUE ('${roleAnswer.newRoleName}','${roleAnswer.salary}',${deptId.id})`);
            console.log(`Added ${roleAnswer.newRoleName} to the database`);
        } else if (answer.action == 'add an employee') {
            // Get current employees and roles then 
            // use that info in the question to add the employee
            const [empResults, empFields] = await connection.execute('SELECT * FROM employee');
            const [roleResults, roleFields] = await connection.execute('SELECT * FROM role');
            // Pull just the array data needed from the db results
            const roles = Array.from(roleResults, x => x.title);
            const emps = Array.from(empResults, x => x.first_name + ' ' + x.last_name);
            // add a 'none' option to the list of possible managers
            emps.push('None');
            const empAnswer = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'empFirstName',
                    message: 'What is the employee first name?'
                },
                {
                    type: 'input',
                    name: 'empLastName',
                    message: 'What is the employee last name?'
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is the role of this employee?',
                    choices: roles
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Who is the employee\'s manager?',
                    choices: emps
                }
            ]);
            // match up the answers with the id for role and for manager
            const roleId = roleResults.find(element => element.title == empAnswer.role);
            const managerId = empResults.find(element => (element.first_name + ' ' + element.last_name) == empAnswer.manager);
            // Update the database
            const [newEmpResults, newRoleFields] = await connection.execute(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUE ('${empAnswer.empFirstName}','${empAnswer.empLastName}',${roleId.id},${managerId ? managerId.id : null})`);
            console.log(`Added ${empAnswer.empFirstName + ' ' + empAnswer.empLastName} to the database`);
        } else if (answer.action == 'update an employee role') {
            // Get current employees and roles then 
            // use that info in the question to update the employee
            const [empResults, empFields] = await connection.execute('SELECT * FROM employee');
            const [roleResults, roleFields] = await connection.execute('SELECT * FROM role');
            // Pull just the array data needed from the db results
            const roles = Array.from(roleResults, x => x.title);
            const emps = Array.from(empResults, x => x.first_name + ' ' + x.last_name);
            
            const updAnswer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'emp',
                    message: 'Which employee would you like to update?',
                    choices: emps
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is the new employee role?',
                    choices: roles
                }
            ]);
            // match up the answers with the id for role and for manager
            const roleId = roleResults.find(element => element.title == updAnswer.role);
            const empId = empResults.find(element => (element.first_name + ' ' + element.last_name) == updAnswer.emp);
            const [updResult, updFields] = await connection.execute(`UPDATE employee SET role_id=${roleId.id} WHERE id=${empId.id}`);
            console.log(`Updated ${updAnswer.emp} with new role as ${updAnswer.role} in the database`);
        }
        init();
    }
}


console.log(` ______                 _                        
|  ____|               | |                       
| |__   _ __ ___  _ __ | | ___  _   _  ___  ___  
|  __| | '_ ' _ \\| '_ \\| |/ _ \\| | | |/ _ \\/ _ \\ 
| |____| | | | | | |_) | | (_) | |_| |  __/  __/ 
|______|_| |_| |_| .__/|_|\\___/ \\__, |\\___|\\___| 
|  \\/  |         | |             __/ |           
| \\  / | __ _ _ _|_| __ _  __ _ |___/_ __        
| |\\/| |/ _' | '_ \\ / _' |/ _' |/ _ \\ '__|       
| |  | | (_| | | | | (_| | (_| |  __/ |          
|_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|          
                           __/ |                 
                           |___/                  `);
init();