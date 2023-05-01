/* eslint-disable @typescript-eslint/naming-convention */
import { QueryDao } from '../dao/QueryDao';
import {U2C_SQLMAP_QUERY} from '../../../types/User';

export const QueryService = {
    
    login(id: string): Promise<U2C_SQLMAP_QUERY> {
      console.log('id',id);
      return QueryDao.select(id);
    },
    create(user: U2C_SQLMAP_QUERY): Promise<U2C_SQLMAP_QUERY> {
      return QueryDao.create(user);
    },
    update(user: U2C_SQLMAP_QUERY): Promise<U2C_SQLMAP_QUERY> {
      return QueryDao.update(user);
    },
    delete(id: number): Promise<void> {
      return QueryDao.delete(id);
    },
    async selectSqlMapSeq() : Promise<string>{
      return await QueryDao.selectSqlMapSeq();
    }
  };
  
  const queryEdit: U2C_SQLMAP_QUERY = {
    QUERY_ID : "",
    USE_YN : "",
    CREATE_USER : "",
    CREATE_DATE : "",
    UPDATE_USER : "",
    UPDATE_DATE : "",
    DESCRIPTION : "",
    QUERY_NAME : "",
    QUERY_TYPE : "",
    SQL_0 : "",
    SQL_1 : "",
    SQL_2 : "",
    SQL_3 : "",
    SQL_4 : "",
    SQLMAP_ID : "",
    STATE: "",
  };
  