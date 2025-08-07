import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: "15.223.11.152",
  user: "app_user",
  password: "mpl",
  database: "MPL",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export default pool;