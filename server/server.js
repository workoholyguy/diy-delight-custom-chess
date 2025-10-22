import express from "express";
import router from "./routes/pieces.js";
import customItemsRouter from "./routes/customItems.js";
import "./config/dotenv.js";
import cors from "cors";

const app = express();

// ✅ CORS: allow configured frontend origins (support comma-separated list)
const rawOrigins = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const allowedOrigins = rawOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);

app.use(express.json());

// ✅ Routes
app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      '<h1 style="text-align: center; margin-top: 50px;">Custom Chess API</h1>' +
        '<h2 style="text-align: center; margin-top: 50px;">This machine serves the API, routes, and database operations for the Custom Chess app.</h2>'
    );
});

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/pieces", router);
app.use("/api/custom-items", customItemsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
