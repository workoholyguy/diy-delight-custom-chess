import { pool } from "../config/database.js";

export const getChessPieces = async (req, res) => {
  try {
    const results = await pool.query("SELECT * FROM chess ORDER BY id ASC");
    res.status(200).json(results.rows);
  } catch (err) {
    console.error("⚠️ Could not retrieve the chess table", err);
    res.status(500).json({ error: err.message });
  }
};

export const getChessById = async (req, res) => {
  try {
    const selectQuery = `
      SELECT id, name, pieceColor, chessboard, material, image_path, description, price
      FROM chess
      WHERE id = $1
    `;
    const chessId = req.params.id;
    const results = await pool.query(selectQuery, [chessId]);
    if (results.rowCount === 0) {
      return res
        .status(404)
        .json({ error: `Chess piece with id ${chessId} not found` });
    }
    res.status(200).json(results.rows[0]);
  } catch (error) {
    console.error("We could not retrieve a chess piece by id:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateChessPiece = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, pieceColor, chessboard, image_path, description, price } =
      req.body;

    const results = await pool.query(
      `
      UPDATE chess
      SET name = $1,
          pieceColor = $2,
          chessboard = $3,
          image_path = $4,
          description = $5,
          price = $6
      WHERE id = $7
      RETURNING *
      `,
      [name, pieceColor, chessboard, image_path, description, price, id]
    );

    if (results.rowCount === 0) {
      return res
        .status(404)
        .json({ error: `Chess piece with id ${id} not found` });
    }

    res.status(200).json(results.rows[0]);
  } catch (error) {
    console.error("Error updating chess piece:", error);
    res.status(409).json({ error: error.message });
  }
};

export const deleteChessPiece = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const results = await pool.query(
      "DELETE FROM chess WHERE id = $1 RETURNING *",
      [id]
    );

    if (results.rowCount === 0) {
      return res
        .status(404)
        .json({ error: `Chess piece with id ${id} not found` });
    }

    res.status(200).json(results.rows[0]);
  } catch (error) {
    console.error("Error deleting chess piece:", error);
    res.status(409).json({ error: error.message });
  }
};
