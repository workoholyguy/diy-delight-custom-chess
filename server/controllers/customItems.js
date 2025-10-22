import { pool } from "../config/database.js";

export const createCustomItem = async (req, res) => {
  try {
    const {
      base_piece_id,
      custom_name,
      selected_color,
      selected_board,
      selected_material,
      price,
      image_path,
    } = req.body;

    const allowedBoards = new Set(["green", "black-white", "wooden"]);

    if (
      !base_piece_id ||
      !custom_name ||
      !selected_color ||
      !selected_board ||
      !selected_material ||
      price == null ||
      !image_path
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (!allowedBoards.has(String(selected_board).toLowerCase())) {
      return res
        .status(400)
        .json({ error: "Please choose a valid chessboard option." });
    }

    const variantQuery = `
      SELECT id, price, image_path
      FROM chess
      WHERE id = $1
        AND LOWER(pieceColor) = LOWER($2)
        AND LOWER(material) = LOWER($3)
    `;

    const variantResult = await pool.query(variantQuery, [
      base_piece_id,
      selected_color,
      selected_material,
    ]);

    if (variantResult.rowCount === 0) {
      return res.status(400).json({
        error:
          "Invalid feature combination. Please select a valid piece configuration.",
      });
    }

    const variantRow = variantResult.rows[0];
    const resolvedPrice = price ?? variantRow.price;
    const resolvedImage = image_path ?? variantRow.image_path;

    const insertQuery = `
      INSERT INTO custom_items (
        base_piece_id,
        custom_name,
        selected_color,
        selected_board,
        selected_material,
        price,
        image_path
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const { rows } = await pool.query(insertQuery, [
      base_piece_id,
      custom_name,
      selected_color,
      selected_board,
      selected_material,
      resolvedPrice,
      resolvedImage,
    ]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating custom item:", error);
    res.status(500).json({ error: "Could not create custom item." });
  }
};

export const listCustomItems = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `
        SELECT
          id,
          base_piece_id,
          custom_name,
          selected_color,
          selected_board,
          selected_material,
          price,
          image_path,
          created_at,
          updated_at
        FROM custom_items
        ORDER BY created_at DESC
      `
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching custom items:", error);
    res.status(500).json({ error: "Could not load custom items." });
  }
};

export const getCustomItem = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows, rowCount } = await pool.query(
      `
        SELECT
          id,
          base_piece_id,
          custom_name,
          selected_color,
          selected_board,
          selected_material,
          price,
          image_path,
          created_at,
          updated_at
        FROM custom_items
        WHERE id = $1
      `,
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Custom piece not found." });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching custom item:", error);
    res.status(500).json({ error: "Could not load custom item." });
  }
};

export const deleteCustomItem = async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query(
      "DELETE FROM custom_items WHERE id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Custom piece not found." });
    }

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting custom item:", error);
    res.status(500).json({ error: "Could not delete custom piece." });
  }
};

export const updateCustomItem = async (req, res) => {
  const { id } = req.params;
  const {
    custom_name,
    selected_color,
    selected_board,
    selected_material,
    base_piece_id,
    price,
    image_path,
  } = req.body;

  const allowedBoards = new Set(["green", "black-white", "wooden"]);

  if (
    !base_piece_id ||
    !custom_name ||
    !selected_color ||
    !selected_board ||
    !selected_material
  ) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!allowedBoards.has(String(selected_board).toLowerCase())) {
    return res
      .status(400)
      .json({ error: "Please choose a valid chessboard option." });
  }

  try {
    const variantQuery = `
      SELECT id, price, image_path
      FROM chess
      WHERE id = $1
        AND LOWER(pieceColor) = LOWER($2)
        AND LOWER(material) = LOWER($3)
    `;

    const variantResult = await pool.query(variantQuery, [
      base_piece_id,
      selected_color,
      selected_material,
    ]);

    if (variantResult.rowCount === 0) {
      return res.status(400).json({
        error:
          "Invalid feature combination. Please select a valid piece configuration.",
      });
    }

    const variantRow = variantResult.rows[0];

    const updateQuery = `
      UPDATE custom_items
      SET
        custom_name = $1,
        selected_color = $2,
        selected_board = $3,
        selected_material = $4,
        price = $5,
        image_path = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;

    const { rows, rowCount } = await pool.query(updateQuery, [
      custom_name,
      selected_color,
      selected_board,
      selected_material,
      price ?? variantRow.price,
      image_path ?? variantRow.image_path,
      id,
    ]);

    if (rowCount === 0) {
      return res.status(404).json({ error: "Custom piece not found." });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error updating custom item:", error);
    res.status(500).json({ error: "Could not update custom piece." });
  }
};
