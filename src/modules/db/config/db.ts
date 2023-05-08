import pool from './mysqlConfig';

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
        console.error('e',e);
      } finally {
        console.error('e',"release");
        if (connection){connection.release();} // 연결 풀에 연결 반환
        //pool.end();
      }
}