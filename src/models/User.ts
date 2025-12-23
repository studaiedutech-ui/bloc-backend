import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  static async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  static async create(name: string, email: string, password: string): Promise<User> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [name, email, password]
    );
    
    const user = await this.findById(result.insertId);
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  static async update(id: number, data: Partial<User>): Promise<User | null> {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    await pool.execute(
      `UPDATE users SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }
}
