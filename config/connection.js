const mysql = require('mysql2');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'team_db'
    },
    console.log('connected to the db')
);

module.exports = db;