import "./dotenv.js";
import { pool } from "./database.js";
import chessData from "../data/chess.js";

const createTables = async () => {
  const ddl = `
    DROP TABLE IF EXISTS custom_items;
    DROP TABLE IF EXISTS chess;

    CREATE TABLE chess (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      pieceColor VARCHAR(50) NOT NULL,
      chessboard VARCHAR(255) NOT NULL,
      material VARCHAR(100) NOT NULL DEFAULT 'wood',
      image_path VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL
    );

    CREATE TABLE custom_items (
      id SERIAL PRIMARY KEY,
      base_piece_id INTEGER REFERENCES chess(id) ON DELETE SET NULL,
      custom_name VARCHAR(255) NOT NULL,
      selected_color VARCHAR(50) NOT NULL,
      selected_board VARCHAR(255) NOT NULL,
      selected_material VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      image_path VARCHAR(255) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await pool.query(ddl);
  console.log("🧱 Tables created/reset successfully");
};

const seedChessTable = async () => {
  const insertQuery = `
    INSERT INTO chess (
      name,
      pieceColor,
      chessboard,
      material,
      image_path,
      description,
      price
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  for (const piece of chessData) {
    const values = [
      piece.name,
      piece.pieceColor,
      piece.chessboard,
      piece.material ?? "classic",
      piece.image_path,
      piece.description,
      piece.price,
    ];

    await pool.query(insertQuery, values);
    console.log(`✅ ${piece.name} (${values[3]}) added`);
  }
};

const reset = async () => {
  try {
    await createTables();
    await seedChessTable();
    console.log("🌱 Database reset & seeded");
  } catch (err) {
    console.error("⚠️ error resetting database", err);
    throw err;
  } finally {
    await pool.end();
  }
};

reset()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
