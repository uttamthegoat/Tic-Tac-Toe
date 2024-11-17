import pool from './database';

export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS tic_tac_toe`);
    await connection.query(`USE tic_tac_toe`);
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(225) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create games table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id VARCHAR(255) NOT NULL UNIQUE,
        player1_id INT,
        player2_id INT,
        board JSON,
        status ENUM('waiting', 'playing', 'finished') DEFAULT 'waiting',
        winner_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player1_id) REFERENCES users(id),
        FOREIGN KEY (player2_id) REFERENCES users(id),
        FOREIGN KEY (winner_id) REFERENCES users(id)
      )
    `);

    // Insert default users
    // await connection.query(`
    //   INSERT IGNORE INTO users (username, password) VALUES 
    //   ('player1', 'pass124'),
    //   ('player2', 'pass124')
    // `);

    console.log('Database initialized successfully');
    connection.release();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
} 