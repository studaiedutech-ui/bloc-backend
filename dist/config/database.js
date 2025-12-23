import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
export default pool;
// Test connection
pool.getConnection()
    .then(connection => {
    console.log('✅ MySQL Database connected successfully');
    connection.release();
})
    .catch(err => {
    console.error('❌ MySQL Database connection failed:', err.message);
});
//# sourceMappingURL=database.js.map