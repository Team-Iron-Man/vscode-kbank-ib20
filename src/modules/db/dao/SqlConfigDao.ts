import { executeQuery, query } from '../config/db';
import { U2CSQLMAPCONFIG, U2C_SQLMAP_QUERY } from '../../../types/SqlConfig';

export const SqlConfigDao = {

  async login(id: string): Promise<U2CSQLMAPCONFIG> {
    console.log('LoginDao', id);
    const rows = await query('SELECT * FROM U2A_USER WHERE USER_ID = ?', [id]);
    console.log('rows[0]', rows[0]);
    return rows[0] as U2CSQLMAPCONFIG;
  },
  async getSqlMapConfig(): Promise<U2CSQLMAPCONFIG[]> {
    //resultMap="SqlMapConfigResult"
    console.log("DB STEP 3 : SqlConfigDao getSqlMapConfig()");
    const getsqlmapconfig = `
      SELECT CONFIG_ID
        ,CONFIG_NAME
        ,DATA_SOURCE
        ,USE_YN
      FROM U2C_SQLMAP_CONFIG
      ORDER BY CONFIG_NAME
    `
    
    console.log("DB STEP 4 : SqlConfigDao getSqlMapConfig() :: getSqlMapConfig:" + getsqlmapconfig);
    const rows = await query(getsqlmapconfig);

    let u2csqlmapconfig: U2CSQLMAPCONFIG[]

    u2csqlmapconfig = rows.map((row: any) => {
      return {

        CONFIG_ID: row.CONFIG_ID,
        CONFIG_NAME: row.CONFIG_NAME,
        DATA_SOURCE: row.DATA_SOURCE,
        USE_YN: row.USE_YN

      };
    });
    return u2csqlmapconfig;

  },
  async getSqlMap(configid: string|undefined): Promise<U2CSQLMAPCONFIG[]> {
    //resultMap="SqlMapResult"
    let u2csqlmapconfig: U2CSQLMAPCONFIG[]
    const getsqlmap = `
        SELECT SQLMAP_ID
          ,SQLMAP_NAME
          ,USE_YN
          ,CONFIG_ID
        FROM U2C_SQLMAP
        WHERE CONFIG_ID = ?
          AND USE_YN = 'Y'
        ORDER BY SQLMAP_NAME`
    const rows = await query(getsqlmap, [configid])

    u2csqlmapconfig = rows.map((row: any) => {
      return {
        SQLMAP_ID: row.SQLMAP_ID,
        SQLMAP_NAME: row.SQLMAP_NAME,
        USE_YN: row.USE_YN,
        CONFIG_ID: row.CONFIG_ID

      };
    });
    return u2csqlmapconfig;
  },
  async getSqlMapQueryList(sqlmapid: string): Promise<U2C_SQLMAP_QUERY[]> {
    //resultMap="SqlMapQueryListResult"
    let u2csqlmapquery: U2C_SQLMAP_QUERY[]
    const getsqlmapquerylist = `
    SELECT QUERY_ID
      ,QUERY_NAME
      ,QUERY_TYPE
      ,SQL_0
      ,SQL_1
      ,SQL_2
      ,SQL_3
      ,SQL_4
      ,SQLMAP_ID
      ,USE_YN
      ,DESCRIPTION
    FROM U2C_SQLMAP_QUERY
    WHERE SQLMAP_ID = ?
    ORDER BY QUERY_NAME`
    const rows = await query(getsqlmapquerylist, [sqlmapid])

    u2csqlmapquery = rows.map((row: any) => {
      return {
        QUERY_ID: row.QUERY_ID,
        USE_YN: row.USE_YN,
        CREATE_USER: row.CREATE_USER,
        CREATE_DATE: row.CREATE_DATE,
        UPDATE_USER: row.UPDATE_USER,
        UPDATE_DATE: row.UPDATE_DATE,
        DESCRIPTION: row.DESCRIPTION,
        QUERY_NAME: row.QUERY_NAME,
        QUERY_TYPE: row.QUERY_TYPE,
        SQL_0: row.SQL_0,
        SQL_1: row.SQL_1,
        SQL_2: row.SQL_2,
        SQL_3: row.SQL_3,
        SQL_4: row.SQL_4,
        SQLMAP_ID: row.SQLMAP_ID,
        STAT: row.STAT,
      };
    });
    return u2csqlmapquery;
  },
  async getSqlMapQuery(queryid: string): Promise<U2CSQLMAPCONFIG[]> {
    //resultMap="SqlMapQueryResult"
    let u2csqlmapconfig: U2CSQLMAPCONFIG[]
    const getsqlmapquery = `
      SELECT QUERY_ID
        ,QUERY_NAME
        ,QUERY_TYPE
        ,SQL_0
        ,SQLMAP_ID
        ,USE_YN
        ,STATE
      FROM U2C_SQLMAP_QUERY
      WHERE QUERY_ID = ?`
    const rows = await query(getsqlmapquery, [queryid])

    u2csqlmapconfig = rows.map((row: any) => {
      return {
        QUERY_ID: row.QUERY_ID,
        QUERY_NAME: row.QUERY_NAME,
        QUERY_TYPE: row.QUERY_TYPE,
        SQL_0: row.SQL_0,
        SQLMAP_ID: row.SQLMAP_ID,
        USE_YN: row.USE_YN,
        STATE: row.STATE

      };
    });
    return u2csqlmapconfig;
  },
  async searchQuery(queryid: string): Promise<U2CSQLMAPCONFIG[]> {
    //resultMap="SqlMapQueryResult"
    let u2csqlmapconfig: U2CSQLMAPCONFIG[]
    const searchquery = `
      SELECT q.QUERY_ID
        ,q.QUERY_NAME
        ,q.QUERY_TYPE
        ,q.SQLMAP_ID
        ,q.SQL_0
        ,q.SQL_1
        ,q.SQL_2
        ,q.SQL_3
        ,q.SQL_4
        ,s.SQLMAP_NAME
        ,s.CONFIG_ID
        ,q.USE_YN
        ,q.DESCRIPTION
      FROM U2C_SQLMAP_QUERY q
        ,U2C_SQLMAP s
        ,U2C_SQLMAP_CONFIG c
      WHERE s.SQLMAP_ID = q.SQLMAP_ID
        AND s.CONFIG_ID = c.CONFIG_ID
        AND q.QUERY_NAME LIKE ?
      ORDER BY q.SQLMAP_ID`
    const rows = await query(searchquery, [queryid])

    u2csqlmapconfig = rows.map((row: any) => {//TO DO 컬럼에 맞게 수정
      return {
        QUERY_ID: row.QUERY_ID,
        QUERY_NAME: row.QUERY_NAME,
        QUERY_TYPE: row.QUERY_TYPE,
        SQL_0: row.SQL_0,
        SQLMAP_ID: row.SQLMAP_ID,
        USE_YN: row.USE_YN,
        STATE: row.STATE

      };
    });
    return u2csqlmapconfig;
  }, 
  async checkSqlMap(configid: string|undefined, sqlmapname: string): Promise<U2CSQLMAPCONFIG[]> {
    //resultMap="checkSqlMapResult"
    let u2csqlmapconfig: U2CSQLMAPCONFIG[]
    const searchquery = `
      SELECT SQLMAP_ID
        ,SQLMAP_NAME
        ,CONFIG_ID
      FROM U2C_SQLMAP
      WHERE CONFIG_ID = ?
        AND SQLMAP_NAME = ?
        AND USE_YN = 'Y'`
    const rows = await query(searchquery, [configid, sqlmapname])

    u2csqlmapconfig = rows.map((row: any) => {//TO DO 컬럼에 맞게 수정
      return {
        SQLMAP_ID: row.SQLMAP_ID,
        SQLMAP_NAME: row.SQLMAP_NAME,
        CONFIG_ID: row.CONFIG_ID

      };
    });
    return u2csqlmapconfig;
  }, 
  async insertSqlMap(configid: string|undefined, sqlmapname: string|undefined): Promise<void> {
    
    //TODO: 운영적용시, oracle 문법(NEXTVAL) <-> mysql 용으로 변경
    /* //운영적용 시
    const searchquery = `
      INSERT INTO
        U2C_SQLMAP (SQLMAP_ID, SQLMAP_NAME, CONFIG_ID, USE_YN, STATE)
        VALUES (U2C_SQLMAP_SEQ.NEXTVAL, ?, ?, 'Y', '01')`
    */

    //테스트 시
    const searchquery = `
        INSERT INTO U2C_SQLMAP (SQLMAP_NAME, CONFIG_ID, USE_YN, STATE)
        VALUES (?, ?, 'Y', '01')
        `
    const rows = await query(searchquery, [sqlmapname,configid])
  }, 
  async deleteSqlMap(sqlmapid:string): Promise<void> {
    const searchquery = `
      UPDATE U2C_SQLMAP
        SET  USE_YN = 'N', STATE = '06'
      WHERE SQLMAP_ID = ?`
    const rows = await query(searchquery, [sqlmapid])
  }

  // async create(user: U2CSQLMAPCONFIG): Promise<U2CSQLMAPCONFIG> {
  //   const { NAME, EMAIL } = user;
  //   const [result]: any[][] = await executeQuery('INSERT INTO users (name, email) VALUES (?, ?)', [NAME, EMAIL]);
  //   return { ...user, USER_ID: result[0].insertid };
  // },

  // async update(user: U2CSQLMAPCONFIG): Promise<U2CSQLMAPCONFIG> {
  //   const { USER_ID, NAME, EMAIL } = user;
  //   await executeQuery('UPDATE users SET name = ?, email = ? WHERE id = ?', [NAME, EMAIL, USER_ID]);
  //   return user;
  // },
  // async delete(id: number): Promise<void> {
  //   await executeQuery('DELETE FROM users WHERE id = ?', [id]);
  // }

};