import {executeQuery, query} from '../config/db';
import {User} from '../../../types/User';

export const LoginDao = {

  async login(id: string): Promise<User> {
    console.log('LoginDao',id);
    const rows = await query('SELECT * FROM U2A_USER WHERE USER_ID = ?', [id]);
    console.log('rows[0]',rows[0]);
    return rows[0] as User;
  },
  
  async create(user: User): Promise<User> {
    const { NAME, EMAIL } = user;
    const [result]: any[][] = await executeQuery('INSERT INTO users (name, email) VALUES (?, ?)', [NAME, EMAIL]);
    return { ...user, USER_ID: result[0].insertid };
  },

  async update(user: User): Promise<User> {
    const { USER_ID, NAME, EMAIL } = user;
    await executeQuery('UPDATE users SET name = ?, email = ? WHERE id = ?', [NAME, EMAIL, USER_ID]);
    return user;
  },
  async delete(id: number): Promise<void> {
    await executeQuery('DELETE FROM users WHERE id = ?', [id]);
  }

};