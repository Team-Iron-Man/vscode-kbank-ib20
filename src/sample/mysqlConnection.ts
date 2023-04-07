import * as mysql from "mysql2/promise";
const config = require('./config/mysqlConfig');

interface IDbConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
  }
  
  export default class MySQL {
    private pool: mysql.Pool;
  
    constructor(config: IDbConfig) {
      this.pool = mysql.createPool({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        port: config.port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }
  
    async query(sql: string, values: any[] = []): Promise<any> {
      const connection = await this.pool.getConnection();
      try {
        const [rows] = await connection.query(sql, values);
        await connection.query(sql, values);
        return rows;
      } finally {
        console.log("query finally");
        connection.release();
      }
    }
  }
