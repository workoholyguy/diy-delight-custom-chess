import { Link } from "react-router-dom";
import "./ChessCard.css";

const formatLabel = (value) =>
  String(value ?? "")
    .split(/[\s_-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const ChessCard = ({ piece }) => {
  const color = piece.piececolor ?? piece.pieceColor;
  const material = (piece.material ?? "").toLowerCase();
  const boardBackground = piece.boardBackground ?? "/boards/classic.png";

  return (
    <article className="card">
      <div className="card__media">
        <img
          className="card__board"
          src={boardBackground}
          alt={`${formatLabel(piece.chessboard)} board background`}
          aria-hidden="true"
        />
        <img
          className="card__piece"
          src={piece.imageUrl}
          alt={`${formatLabel(color)} ${formatLabel(
            piece.name
          )} on ${formatLabel(piece.chessboard)} board`}
          loading="lazy"
        />
      </div>

      <div className="card__body">
        <h2>{formatLabel(piece.name)}</h2>
        <dl>
          <div>
            <dt>Colorway</dt>
            <dd>{formatLabel(color)}</dd>
          </div>
          {material && (
            <div>
              <dt>Material</dt>
              <dd>{formatLabel(material)}</dd>
            </div>
          )}
          <div>
            <dt>Board</dt>
            <dd>{formatLabel(piece.chessboard)}</dd>
          </div>
        </dl>
        <p className="card__description">{piece.description}</p>
      </div>

      <footer className="card__footer">
        <span className="card__price">…</span>
        <Link to={`/pieces/${piece.id}`} className="card__cta">
          Customize
        </Link>
      </footer>
    </article>
  );
};

export default ChessCard;
