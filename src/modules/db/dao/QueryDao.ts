/* eslint-disable @typescript-eslint/naming-convention */
import {executeQuery, query} from '../config/db';
import {U2C_SQLMAP_QUERY} from '../../../types/User';

export const QueryDao = {

  async select(id: string): Promise<U2C_SQLMAP_QUERY> {
    console.log('LoginDao',id);
    const rows = await query('SELECT QUERY_ID, USE_YN, CREATE_USER, CREATE_DATE, UPDATE_USER, UPDATE_DATE, DESCRIPTION, QUERY_NAME, QUERY_TYPE, SQL_0, SQL_1, SQL_2, SQL_3, SQL_4, SQLMAP_ID, STATE FROM xe.U2C_SQLMAP_QUERY WHERE QUERY_ID = ?', [id]);
    console.log('rows[0]',rows[0]);
    return rows[0] as U2C_SQLMAP_QUERY;
  },

  async selectSqlMapSeq(): Promise<string>{
    const rows = await query("select nextval('TEST_SEQ') as QUERY_ID from dual");
    console.log('rows[0]',rows);
    return rows.QUERY_ID;
  },

  async create(u2c_sqlmap_query: U2C_SQLMAP_QUERY): Promise<U2C_SQLMAP_QUERY> {
    const [result]: any[][] = await executeQuery('INSERT INTO xe.U2C_SQLMAP_QUERY(QUERY_ID, USE_YN, CREATE_USER, CREATE_DATE, UPDATE_USER, UPDATE_DATE, DESCRIPTION, QUERY_NAME, QUERY_TYPE, SQL_0, SQL_1, SQL_2, SQL_3, SQL_4, SQLMAP_ID, STATE)VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',u2c_sqlmap_query);
    return { ...u2c_sqlmap_query, QUERY_ID: result[0].QUERY_ID };
  },

  async update(u2c_sqlmap_query: U2C_SQLMAP_QUERY): Promise<U2C_SQLMAP_QUERY> {
    const [result]: any[][] = await executeQuery('UPDATE users SET name = ?, email = ? WHERE id = ?', u2c_sqlmap_query);
    return { ...u2c_sqlmap_query, QUERY_ID: result[0].QUERY_ID };
  },
  
  async delete(id: number): Promise<void> {
    await executeQuery('DELETE FROM users WHERE id = ?', [id]);
  }

  };
