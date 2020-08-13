const configHolder = require('./config');
const mysql = require('mysql');

const pool  = mysql.createPool({
    connectionLimit : 10,
    host: configHolder.host_name,
    user: configHolder.user_name,
    password: configHolder.password,
    database: configHolder.database,
    multipleStatements: true
});

// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
    }

    if (connection) connection.release();

    return
})

module.exports = pool;