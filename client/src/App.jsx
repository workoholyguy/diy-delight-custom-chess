import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import CatalogPage from "./pages/CatalogPage.jsx";
import PieceDetails from "./pages/PieceDetails.jsx";
import CustomPieces from "./pages/CustomPieces.jsx";
import CustomPieceEditor from "./pages/CustomPieceEditor.jsx";

const BOARD_BACKGROUNDS = {
  green: "/boards/classic.png",
  classic: "/boards/classic.png",
  "black-white": "/boards/black-white.jpg",
  wooden: "/boards/wooden.webp",
};

const getBoardBackground = (board) => {
  const normalized = (board ?? "").toLowerCase();
  return BOARD_BACKGROUNDS[normalized] ?? BOARD_BACKGROUNDS.green;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  ""
);

const buildApiUrl = (path) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const formatLabel = (value) =>
  value
    .split(/[\s_-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const resolveImagePath = (path) => {
  if (!path) return "/logo.png";
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

function App() {
  const [pieces, setPieces] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pieceFilter, setPieceFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [boardFilter, setBoardFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPieces = async () => {
      try {
        const response = await fetch(buildApiUrl("/api/pieces"));
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();

        const normalizePiece = (piece) => {
          const chessboard = piece.chessboard ?? "";
          return {
            ...piece,
            pieceColor: piece.piececolor ?? piece.pieceColor,
            imageUrl: resolveImagePath(piece.image_path),
            boardBackground: getBoardBackground(chessboard),
          };
        };

        setPieces(data.map(normalizePiece));
        setError(null);
      } catch (err) {
        console.error("Unable to load chess catalog:", err);
        setError("We couldn't load the chess catalog. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPieces();
  }, []);

  const pieceTypes = useMemo(() => {
    const labels = new Set(pieces.map((piece) => piece.name));
    return ["all", ...Array.from(labels).sort()];
  }, [pieces]);

  const pieceColors = useMemo(() => {
    const labels = new Set(
      pieces.map((piece) => piece.piececolor ?? piece.pieceColor)
    );
    return ["all", ...Array.from(labels).sort()];
  }, [pieces]);

  const chessboards = useMemo(() => {
    const labels = new Set(pieces.map((piece) => piece.chessboard));
    return ["all", ...Array.from(labels).sort()];
  }, [pieces]);

  const visiblePieces = useMemo(() => {
    const whitePieces = pieces.filter(
      (piece) =>
        (piece.piececolor ?? piece.pieceColor)?.toLowerCase() === "white"
    );

    const uniqueWhitePieces = Array.from(
      whitePieces
        .reduce((acc, piece) => {
          const key = piece.name?.toLowerCase();
          if (!acc.has(key)) acc.set(key, piece);
          return acc;
        }, new Map())
        .values()
    );

    const normalizedTerm = searchTerm.trim().toLowerCase();

    return uniqueWhitePieces.filter((piece) => {
      const name = piece.name?.toLowerCase() ?? "";
      const color = (piece.piececolor ?? piece.pieceColor ?? "").toLowerCase();
      const board = piece.chessboard?.toLowerCase() ?? "";
      const description = piece.description?.toLowerCase() ?? "";

      if (pieceFilter !== "all" && name !== pieceFilter.toLowerCase())
        return false;
      if (colorFilter !== "all" && color !== colorFilter.toLowerCase())
        return false;
      if (boardFilter !== "all" && board !== boardFilter.toLowerCase())
        return false;

      if (
        normalizedTerm &&
        !name.includes(normalizedTerm) &&
        !color.includes(normalizedTerm) &&
        !board.includes(normalizedTerm) &&
        !description.includes(normalizedTerm)
      ) {
        return false;
      }

      return true;
    });
  }, [pieces, pieceFilter, colorFilter, boardFilter, searchTerm]);

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__content">
          <img
            className="hero__mark"
            src="/logo.png"
            alt="CustomChess logo"
            width="96"
            height="96"
          />
          <div>
            <h1>Custom Chess Studio</h1>
            <p>
              Mix-and-match handcrafted chess pieces and boards. Browse the
              catalog, explore colorways, and find the perfect set for your next
              match.
            </p>
            <div className="hero__actions">
              <Link to="/">Catalog</Link>
              <Link to="/my-pieces">Saved Pieces</Link>
            </div>
          </div>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <CatalogPage
              visiblePieces={visiblePieces}
              pieceTypes={pieceTypes}
              pieceFilter={pieceFilter}
              onPieceFilterChange={setPieceFilter}
              pieceColors={pieceColors}
              colorFilter={colorFilter}
              onColorFilterChange={setColorFilter}
              chessboards={chessboards}
              boardFilter={boardFilter}
              onBoardFilterChange={setBoardFilter}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              loading={loading}
              error={error}
            />
          }
        />

        <Route path="/pieces/:id" element={<PieceDetails pieces={pieces} />} />
        <Route
          path="/my-pieces/:id/edit"
          element={<CustomPieceEditor pieces={pieces} />}
        />
        <Route path="/my-pieces" element={<CustomPieces />} />
      </Routes>
    </div>
  );
}

export default App;
