import { LoginDao } from '../dao/LoginDao';
import {User} from '../../../types/User';

export const LoginService = {
    
    async login(id: string): Promise<User> {
      console.log('id',id);
      return LoginDao.login(id);
    },
    async create(user: User): Promise<User> {
      return LoginDao.create(user);
    },
    async update(user: User): Promise<User> {
      return LoginDao.update(user);
    },
    async delete(id: number): Promise<void> {
      return LoginDao.delete(id);
    }
  };
  