// export interface U2CSQLMAP {
//   password: string;
//   sqlmap_id : string;
//   sqlmap_name : string;
//   use_yn : string;
//   create_user : string;
//   create_date : string;
//   update_user : string;
//   update_date : string;
//   description : string;
//   config_id : string;
//   state : string;
// }
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

// export interface U2C_SQLMAP_HISTORY{
//   SQLMAP_ID : string;
//   SQLMAP_NAME : string;
//   USE_YN : string;
//   CREATE_USER : string;
//   CREATE_DATE : string;
//   UPDATE_USER : string;
//   UPDATE_DATE : string;
//   DESCRIPTION : string;
//   CONFIG_ID : string;
//   UPDATE_SEQ_NO : string;
// }

// export interface U2C_SQLMAP_QUERY{
//   QUERY_ID : string;
//   USE_YN : string;
//   CREATE_USER : string;
//   CREATE_DATE : string;
//   UPDATE_USER : string;
//   UPDATE_DATE : string;
//   DESCRIPTION : string;
//   QUERY_NAME : string;
//   QUERY_TYPE : string;
//   SQL_0 : string;
//   SQL_1 : string;
//   SQL_2 : string;
//   SQL_3 : string;
//   SQL_4 : string;
//   SQLMAP_ID : string;
//   STATE: string;
// }

// export interface U2C_SQLMAP_QUERY_HISTORY{
//   QUERY_ID : string;
//   USE_YN : string;
//   CREATE_USER : string;
//   CREATE_DATE : string;
//   UPDATE_USER : string;
//   UPDATE_DATE : string;
//   DESCRIPTION : string;
//   QUERY_NAME : string;
//   QUERY_TYPE : string;
//   SQL_0 : string;
//   SQL_1 : string;
//   SQL_2 : string;
//   SQL_3 : string;
//   SQL_4 : string;
//   SQLMAP_ID : string;
//   UPDATE_SEQ_NO : string;
// }