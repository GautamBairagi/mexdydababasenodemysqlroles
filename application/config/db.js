const mysql = require('mysql2');

const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'mexdy',
    charset: 'utf8mb4',
    multipleStatements: false,
    timezone: 'Z',
};

const pool = mysql.createPool(dbConfig);
module.exports = pool.promise();
