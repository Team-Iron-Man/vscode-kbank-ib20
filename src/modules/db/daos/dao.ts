import * as mysql from "mysql2/promise";
const config = require('../connection/config/mysqlConfig');

interface IDbConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
  }

class Dao {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool(config);
  }

  public async execute(sql: string, values: any): Promise<any> {
    const connection = await this.pool.getConnection();
    try {
      // 트랜잭션 시작
      await connection.beginTransaction();

      // SQL 문 실행
      const [rows] = await connection.execute(sql, values);

      // 커밋
      await connection.commit();

      // 결과 반환
      return rows;
    } catch (error) {
      // 롤백
      if (connection) {
        await connection.rollback();
      }

      // 에러 처리
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  async query(sql: string, values?: any): Promise<any> {
    const conn = await this.pool.getConnection();
    try {
      const [rows] = await conn.query(sql, values);
      return rows;
    } finally {
      conn.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export default Dao;
