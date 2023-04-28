import * as mysql from "mysql2/promise";

const config = {
    host: 'ironfarm.kr',
    user: 'cresh0105',
    password: 'password1!',
    database: 'xe',
    port: 3377,
    waitForConnections: false,
    connectionLimit: 10,
    queueLimit: 0,
};


const pool = mysql.createPool(config);

export default pool;
