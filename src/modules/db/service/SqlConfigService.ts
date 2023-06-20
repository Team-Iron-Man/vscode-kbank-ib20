import { SqlConfigDao } from '../dao/SqlConfigDao';
import { U2CSQLMAPCONFIG } from '../../../types/SqlConfig';

export const SqlConfigService = {
    
    // async login(id: string): Promise<U2CSQLMAPCONFIG> {
    //   console.log('id',id);
    //   return SqlConfigDao.login(id);
    // },
    
    async selectSqlConfig(): Promise<U2CSQLMAPCONFIG[]> {
      console.log('ALM#2-1 [Get Data From DB] 쿼리 Req ===> SqlConfigService.selectSqlConfig() 호출')
      return SqlConfigDao.getSqlMapConfig();
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
  