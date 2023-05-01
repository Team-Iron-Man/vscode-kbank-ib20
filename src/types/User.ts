export interface User {
  USER_ID : string
  NAME : string
  USER_GROUP_ID : string
  POSITION : string
  RANK : string
  TEL : string
  EMAIL : string
  PHONE : string
  PASSWORD : string
  REGISTER : string
  REG_DATETIME : string
  LAST_MODIFIER : string
  LAST_MOD_DATETIME : string
  STATE : string
  IS_DELETED : string
  CM_ID : string
  CM_PASSWORD : string
  IS_APPROVAL : string
  IS_LOCK : string
  ACCESS_IP : string
}


export interface U2C_SQLMAP_QUERY{
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