import pool from '../config/database';
export class ChatModel {
    static async findByUserId(userId, limit = 50) {
        const [rows] = await pool.execute('SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit]);
        return rows;
    }
    static async findByProjectId(projectId) {
        const [rows] = await pool.execute('SELECT * FROM chat_messages WHERE project_id = ? ORDER BY created_at ASC', [projectId]);
        return rows;
    }
    static async create(userId, role, content, projectId) {
        const [result] = await pool.execute('INSERT INTO chat_messages (user_id, project_id, role, content, created_at) VALUES (?, ?, ?, ?, NOW())', [userId, projectId || null, role, content]);
        const [rows] = await pool.execute('SELECT * FROM chat_messages WHERE id = ?', [result.insertId]);
        return rows[0];
    }
}
//# sourceMappingURL=Chat.js.map