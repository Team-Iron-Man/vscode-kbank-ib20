import { SqlConfigDao } from '../dao/SqlConfigDao';
import { U2CSQLMAPCONFIG } from '../../../types/SqlConfig';

export const SqlConfigService = {
    
    // async login(id: string): Promise<U2CSQLMAPCONFIG> {
    //   console.log('id',id);
    //   return SqlConfigDao.login(id);
    // },
    
    async selectSqlConfig(): Promise<U2CSQLMAPCONFIG[]> {
      console.log("DB STEP 2 : SqlConfigService =======");  
      return SqlConfigDao.u2csqlmapconfigSelect();
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
  