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

const q1 = [
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
    const answer = await inquirer.prompt(q1);
    if (answer.action == 'quit') {
        connection.destroy();
        process.exit(0);
    } else {
        if (answer.action == 'view all departments') {
            const [results, fields] = await connection.execute('SELECT * FROM department');
            console.table(results);
            console.log('\n');
        } else if (answer.action == 'view all roles') {
            const [results, fields] = await connection.execute('SELECT role.id, role.title, role.salary, department.name FROM role LEFT JOIN department on role.department_id = department.id');
            console.table(results);
            console.log('\n');
        } else if (answer.action == 'view all employees') {
            const [results, fields] = await connection.execute(`SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(manager.first_name,' ', manager.last_name) as manager FROM 
            employee 
            LEFT JOIN role ON employee.role_id = role.id 
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee AS manager ON employee.manager_id = manager.id`);
            console.table(results);
            console.log('\n');
        } else if (answer.action == 'add a department') {
            const deptAnswer = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'newDeptName',
                    message: 'What is the new department name?'
                }
            ]);
            const [results, fields] = await connection.execute('INSERT INTO department (name) VALUE (\'' + deptAnswer.newDeptName + '\')');
        } else if (answer.action == 'add a role') {
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
            const [results, fields] = await connection.execute(`INSERT INTO role (title, salary, department_id) VALUE ('${roleAnswer.newRoleName}','${roleAnswer.salary}','${deptId.id}')`);
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