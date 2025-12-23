import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface ChatMessage {
  id: number;
  user_id: number;
  project_id?: number;
  role: 'user' | 'assistant';
  content: string;
  created_at?: Date;
}

export class ChatModel {
  static async findByUserId(userId: number, limit: number = 50): Promise<ChatMessage[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
    return rows as ChatMessage[];
  }

  static async findByProjectId(projectId: number): Promise<ChatMessage[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM chat_messages WHERE project_id = ? ORDER BY created_at ASC',
      [projectId]
    );
    return rows as ChatMessage[];
  }

  static async create(userId: number, role: string, content: string, projectId?: number): Promise<ChatMessage> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO chat_messages (user_id, project_id, role, content, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, projectId || null, role, content]
    );
    
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM chat_messages WHERE id = ?',
      [result.insertId]
    );
    return rows[0] as ChatMessage;
  }
}
