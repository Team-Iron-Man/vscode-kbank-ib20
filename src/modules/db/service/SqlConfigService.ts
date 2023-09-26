import { SqlConfigDao } from '../dao/SqlConfigDao';
import { U2CSQLMAPCONFIG, U2C_SQLMAP_QUERY } from '../../../types/SqlConfig';

export const SqlConfigService = {
    
    // async login(id: string): Promise<U2CSQLMAPCONFIG> {
    //   console.log('id',id);
    //   return SqlConfigDao.login(id);
    // },
    
    async selectSqlConfig(): Promise<U2CSQLMAPCONFIG[]> {
      console.log('ALM#2-1 [Get Data From DB] 쿼리 Req ===> SqlConfigService.selectSqlConfig() 호출')
      return SqlConfigDao.getSqlMapConfig();
    },
    async getSqlMap(configid: string|undefined): Promise<U2CSQLMAPCONFIG[]> {
      return SqlConfigDao.getSqlMap(configid);
    },
    async checkSqlMap(configid: string|undefined, sqlmapname: string): Promise<U2CSQLMAPCONFIG[]> {
      console.log('ALM#2-1 [Get Data From DB] 쿼리 Req ===> SqlConfigService.checkSqlMap() 호출:configid',configid,':sqlmapname',sqlmapname)
      return SqlConfigDao.checkSqlMap(configid,sqlmapname);
    },
    async insertSqlMap(configid: string|undefined, sqlmapname: string|undefined): Promise<void> {
      return SqlConfigDao.insertSqlMap(configid,sqlmapname);
    },
    async deleteSqlMap(sqlmapid:string): Promise<void> {
      return SqlConfigDao.deleteSqlMap(sqlmapid);
    },
    async getSqlMapQueryList(sqlmapid:string): Promise<U2C_SQLMAP_QUERY[]> {
      return SqlConfigDao.getSqlMapQueryList(sqlmapid);
    },
    async delQry(sqlmapid:string, qryid:string): Promise<void> {
      return SqlConfigDao.delQry(sqlmapid, qryid);
    }
    
   
    // async create(user: U2CSQLMAPCONFIG): Promise<U2CSQLMAPCONFIG> {
    //   return SqlConfigDao.create(user);
    // },
    // async update(user: U2CSQLMAPCONFIG): Promise<U2CSQLMAPCONFIG> {
    //   return SqlConfigDao.update(user);
    // },
    // async delete(id: number): Promise<void> {
    //   return SqlConfigDao.delete(id);
    // }
  };
  