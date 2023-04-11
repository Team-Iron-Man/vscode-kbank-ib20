import {executeQuery, query} from '../config/db';
import {U2CSQLMAPCONFIG} from '../../../types/SqlConfig';

export const SqlConfigDao = {

  async login(id: string): Promise<U2CSQLMAPCONFIG> {
    console.log('LoginDao',id);
    const rows = await query('SELECT * FROM U2A_USER WHERE USER_ID = ?', [id]);
    console.log('rows[0]',rows[0]);
    return rows[0] as U2CSQLMAPCONFIG;
  },
  async u2csqlmapconfigSelect():Promise<U2CSQLMAPCONFIG[]> {

    console.log("DB STEP 3 : SqlConfigDao u2csqlmapconfigSelect()");
    const getSqlMapConfig = 'SELECT CONFIG_ID ,CONFIG_NAME ,DATA_SOURCE ,USE_YN FROM U2C_SQLMAP_CONFIG ORDER BY CONFIG_NAME';
    console.log("DB STEP 4 : SqlConfigDao u2csqlmapconfigSelect() :: getSqlMapConfig:"+getSqlMapConfig);
    const rows = await query(getSqlMapConfig);
    

   const u2csqlmapconfig: U2CSQLMAPCONFIG[] = rows.map((row: any) => {
        return {
        
        CONFIG_ID : row.CONFIG_ID,
        CONFIG_NAME : row.CONFIG_NAME,
        USE_YN : row.USE_YN
        
      };
    });
    
    return u2csqlmapconfig;
    
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