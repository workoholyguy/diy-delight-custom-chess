// client/src/pages/CatalogPage.jsx
import ChessCard from "../components/ChessCard.jsx";
import formatLabel from "../utils/formatLabel.jsx";

const CatalogPage = ({
  visiblePieces,
  pieceTypes,
  pieceFilter,
  onPieceFilterChange,
  pieceColors,
  colorFilter,
  onColorFilterChange,
  chessboards,
  boardFilter,
  onBoardFilterChange,
  searchTerm,
  onSearchTermChange,
  loading,
  error,
}) => {
  return (
    <main className="content">
      <section className="filters" style={{ display: "none" }}>
        <label className="filters__field" htmlFor="search-input">
          <span className="filters__label">Search</span>
          <input
            id="search-input"
            type="search"
            value={searchTerm}
            placeholder="Search by name, color, board, or details…"
            onChange={(event) => onSearchTermChange(event.target.value)}
          />
        </label>

        <label className="filters__field" htmlFor="piece-filter">
          <span className="filters__label">Piece</span>
          <select
            id="piece-filter"
            value={pieceFilter}
            onChange={(event) => onPieceFilterChange(event.target.value)}
          >
            {pieceTypes.map((piece) => (
              <option value={piece} key={piece}>
                {piece === "all" ? "All pieces" : formatLabel(piece)}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field" htmlFor="color-filter">
          <span className="filters__label">Colorway</span>
          <select
            id="color-filter"
            value={colorFilter}
            onChange={(event) => onColorFilterChange(event.target.value)}
          >
            {pieceColors.map((color) => (
              <option value={color} key={color}>
                {color === "all" ? "All colors" : formatLabel(color)}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field" htmlFor="board-filter">
          <span className="filters__label">Board</span>
          <select
            id="board-filter"
            value={boardFilter}
            onChange={(event) => onBoardFilterChange(event.target.value)}
          >
            {chessboards.map((board) => (
              <option value={board} key={board}>
                {board === "all" ? "All boards" : formatLabel(board)}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="catalog">
        {loading && (
          <div className="status status--loading">Loading catalog…</div>
        )}

        {error && (
          <div className="status status--error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && visiblePieces.length === 0 && (
          <div className="status status--empty">
            We couldn&rsquo;t find any pieces that match your filters.
          </div>
        )}

        <div className="catalog__grid">
          {!loading &&
            !error &&
            visiblePieces.map((piece) => {
              const color = piece.piececolor ?? piece.pieceColor;
              const key =
                piece.id ?? `${piece.name}-${color}-${piece.chessboard}`;

              return <ChessCard key={key} piece={piece} />;
            })}
        </div>
      </section>
    </main>
  );
};

export default CatalogPage;
