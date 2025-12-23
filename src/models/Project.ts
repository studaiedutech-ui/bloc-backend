import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  files?: string; // JSON string
  created_at?: Date;
  updated_at?: Date;
}

export class ProjectModel {
  static async findByUserId(userId: number): Promise<Project[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows as Project[];
  }

  static async findById(id: number): Promise<Project | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as Project) : null;
  }

  static async create(userId: number, name: string, description?: string, files?: string): Promise<Project> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO projects (user_id, name, description, files, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [userId, name, description || null, files || null]
    );
    
    const project = await this.findById(result.insertId);
    if (!project) throw new Error('Failed to create project');
    return project;
  }

  static async update(id: number, data: Partial<Project>): Promise<Project | null> {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    await pool.execute(
      `UPDATE projects SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM projects WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}
