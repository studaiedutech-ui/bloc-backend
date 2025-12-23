import pool from '../config/database';
export class ProjectModel {
    static async findByUserId(userId) {
        const [rows] = await pool.execute('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return rows;
    }
    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }
    static async create(userId, name, description, files) {
        const [result] = await pool.execute('INSERT INTO projects (user_id, name, description, files, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())', [userId, name, description || null, files || null]);
        const project = await this.findById(result.insertId);
        if (!project)
            throw new Error('Failed to create project');
        return project;
    }
    static async update(id, data) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];
        await pool.execute(`UPDATE projects SET ${fields}, updated_at = NOW() WHERE id = ?`, values);
        return this.findById(id);
    }
    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}
//# sourceMappingURL=Project.js.map