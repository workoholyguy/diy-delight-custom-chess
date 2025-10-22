import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import formatLabel from "../utils/formatLabel.jsx";

const resolveImagePath = (path) => {
  if (!path) return "/logo.png";
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

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

const CustomPieces = () => {
  const [customPieces, setCustomPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchCustomPieces = async () => {
      try {
        const response = await fetch("/api/custom-items");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        setCustomPieces(data);
      } catch (err) {
        console.error("Unable to load custom pieces:", err);
        setError(
          "We couldn't load the custom catalog. Please refresh and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomPieces();
  }, []);

  const displayPieces = useMemo(
    () =>
      customPieces.map((piece) => ({
        ...piece,
        imageUrl: resolveImagePath(piece.image_path),
        boardBackground: getBoardBackground(piece.selected_board),
      })),
    [customPieces]
  );

  const handleDelete = async (id, name) => {
    if (!id) return;

    const confirmed = window.confirm(
      `Delete "${formatLabel(
        name ?? "this custom piece"
      )}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/custom-items/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`);
      }

      setCustomPieces((previous) =>
        previous.filter((piece) => piece.id !== id)
      );
    } catch (err) {
      console.error("Unable to delete custom piece:", err);
      setError("Could not delete the custom piece. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="content">
      <header className="page-header">
        <h1>Saved Custom Pieces</h1>
        <p>
          Review the custom chess pieces you have crafted. Edit them later or
          build new combinations from the catalog.
        </p>
      </header>

      <section className="catalog">
        {loading && (
          <div className="status status--loading">Loading saved pieces…</div>
        )}

        {error && (
          <div className="status status--error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && displayPieces.length === 0 && (
          <div className="status status--empty">
            You haven&rsquo;t saved any custom pieces yet. Customize a piece
            from the catalog to see it here.
          </div>
        )}

        <div className="catalog__grid">
          {!loading &&
            !error &&
            displayPieces.map((piece) => (
              <article className="card" key={piece.id}>
                <div className="card__media">
                  <img
                    className="card__board"
                    src={piece.boardBackground}
                    alt={`${formatLabel(
                      piece.selected_board
                    )} board background`}
                    aria-hidden="true"
                  />
                  <img
                    className="card__piece"
                    src={piece.imageUrl}
                    alt={`${formatLabel(piece.custom_name)} preview`}
                  />
                </div>

                <div className="card__body">
                  <h2>{formatLabel(piece.custom_name)}</h2>
                  <dl>
                    <div>
                      <dt>Color</dt>
                      <dd>{formatLabel(piece.selected_color)}</dd>
                    </div>
                    <div>
                      <dt>Board</dt>
                      <dd>{formatLabel(piece.selected_board)}</dd>
                    </div>
                    <div>
                      <dt>Material</dt>
                      <dd>{formatLabel(piece.selected_material)}</dd>
                    </div>
                  </dl>
                </div>

                <footer className="card__footer card__footer--custom">
                  <span className="card__price">
                    ${Number(piece.price ?? 0).toFixed(2)}
                  </span>
                  <div className="card__actions">
                    <Link
                      to={`/my-pieces/${piece.id}/edit`}
                      className="card__cta"
                    >
                      Edit
                    </Link>
                    {/* <Link
                      to={`/pieces/${piece.base_piece_id}`}
                      className="card__cta"
                    >
                      Customize New
                    </Link> */}
                    <button
                      type="button"
                      className="card__cta card__cta--danger"
                      onClick={() => handleDelete(piece.id, piece.custom_name)}
                      disabled={deletingId === piece.id}
                    >
                      {deletingId === piece.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </footer>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
};

export default CustomPieces;
