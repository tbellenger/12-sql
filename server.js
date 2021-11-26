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

database();

const q1 = [
    {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role', 'quit']
    }
]

const init = async () => {
    const answer = await inquirer.prompt(q1);
    if (answer.action == 'quit') {
        process.exit(0);
    } else {
        if (answer.action == 'view all departments') {
            const [results, fields] = await connection.execute('SELECT * FROM department');
            console.table(results);
            console.log('\n');
        } else if (answer.action == 'view all roles') {
            const [results, fields] = await connection.execute('SELECT * FROM role');
            console.table(results);
            console.log('\n');
        } else if (answer.action == 'view all employess') {
            const [results, fields] = await connection.execute('SELECT * FROM employee');
            console.table(results);
            console.log('\n');
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