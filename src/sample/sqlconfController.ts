import Dao from '../daos/dao';

interface U2AUSER {
  user_id : string
  name : string
  user_group_id : string
  position : string
  rank : string
  tel : string
  email : string
  phone : string
  password : string
  register : string
  reg_datetime : string
  last_modifier : string
  last_mod_datetime : string
  state : string
  is_deleted : string
  cm_id : string
  cm_password : string
  is_approval : string
  is_lock : string
  access_ip : string
}

interface U2CSQLMAP {
  password: string;
  sqlmap_id : string;
  sqlmap_name : string;
  use_yn : string;
  create_user : string;
  create_date : string;
  update_user : string;
  update_date : string;
  description : string;
  config_id : string;
  state : string;
}

export interface U2CSQLMAPCONFIG {
  CONFIG_ID : string;
  CONFIG_NAME : string;
  DATA_SOURCE : string;
  USE_YN : string;
  MAX_REQUESTS : string;
  MAX_SESSIONS : string;
  MAX_TRANSACTIONS : string;
  CACHE_MODELS_ENABLED : string;
  LAZY_LOADING_ENABLED : string;
  ENHANCEMENT_ENABLED : string;
  USE_STATEMENT_NAMESPACES : string;
  DEFAULT_STATEMENT_TIMEOUT : string;
  CREATE_USER : string;
  CREATE_DATE : string;
  UPDATE_USER : string;
  UPDATE_DATE : string;
  DESCRIPTION : string;
  TRANSACTION_MANAGER : string;
  STATE  : string;
}

interface U2C_SQLMAP_HISTORY{
  SQLMAP_ID : string;
  SQLMAP_NAME : string;
  USE_YN : string;
  CREATE_USER : string;
  CREATE_DATE : string;
  UPDATE_USER : string;
  UPDATE_DATE : string;
  DESCRIPTION : string;
  CONFIG_ID : string;
  UPDATE_SEQ_NO : string;
}

interface U2C_SQLMAP_QUERY{
  QUERY_ID : string;
  USE_YN : string;
  CREATE_USER : string;
  CREATE_DATE : string;
  UPDATE_USER : string;
  UPDATE_DATE : string;
  DESCRIPTION : string;
  QUERY_NAME : string;
  QUERY_TYPE : string;
  SQL_0 : string;
  SQL_1 : string;
  SQL_2 : string;
  SQL_3 : string;
  SQL_4 : string;
  SQLMAP_ID : string;
  STATE: string;
}

interface U2C_SQLMAP_QUERY_HISTORY{
  QUERY_ID : string;
  USE_YN : string;
  CREATE_USER : string;
  CREATE_DATE : string;
  UPDATE_USER : string;
  UPDATE_DATE : string;
  DESCRIPTION : string;
  QUERY_NAME : string;
  QUERY_TYPE : string;
  SQL_0 : string;
  SQL_1 : string;
  SQL_2 : string;
  SQL_3 : string;
  SQL_4 : string;
  SQLMAP_ID : string;
  UPDATE_SEQ_NO : string;
}

async function login(id:string):Promise<string> {
  const dao = new Dao();
  const rows = await dao.query('SELECT * FROM U2A_USER WHERE USER_ID = ?', [id]);
  console.log('rows',rows);
  const u2auser: U2AUSER[] = rows.map((row: any) => {
    return {
        password: row.PASSWORD,
    };
  });
  console.log(u2auser[0].password);
  await dao.close();
  return u2auser[0].password;
}

async function getSqlMapConfig():Promise<U2CSQLMAPCONFIG[]>  {
    const dao = new Dao();
    const getSqlMapConfig = 'SELECT CONFIG_ID ,CONFIG_NAME ,DATA_SOURCE ,USE_YN FROM U2C_SQLMAP_CONFIG ORDER BY CONFIG_NAME';
    const rows = await dao.query(getSqlMapConfig);
    
    console.log("DB STEP 1 : function getSqlMapConfig");
    
    const u2csqlmapconfig: U2CSQLMAPCONFIG[] = rows.map((row: any) => {
      console.log("DB STEP 2 : u2csqlmapconfig ::"+row.CONFIG_ID + "::" + row.CONFIG_NAME);
      return {
        
        CONFIG_ID : row.CONFIG_ID,
        CONFIG_NAME : row.CONFIG_NAME,
        USE_YN : row.USE_YN
        
      };
    });
    await dao.close();
    return u2csqlmapconfig;
}

export {getSqlMapConfig};
