import * as mysql from "mysql2/promise";
const config = require('./mysqlConfig');

const pool = mysql.createPool(config);

export async function executeQuery<T>(query: string, values?: any): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(query, values);
    await connection.commit();
    return rows as T;
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
}

export async function query(sql: string, values?: any): Promise<any> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(sql, values);
        return rows;
      } catch (e) {
      } finally {
        connection.release();
      }
  }

