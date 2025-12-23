import pool from '../config/database';
export class UserModel {
    static async findByEmail(email) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows.length > 0 ? rows[0] : null;
    }
    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }
    static async create(name, email, password) {
        const [result] = await pool.execute('INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', [name, email, password]);
        const user = await this.findById(result.insertId);
        if (!user)
            throw new Error('Failed to create user');
        return user;
    }
    static async update(id, data) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];
        await pool.execute(`UPDATE users SET ${fields}, updated_at = NOW() WHERE id = ?`, values);
        return this.findById(id);
    }
}
//# sourceMappingURL=User.js.map