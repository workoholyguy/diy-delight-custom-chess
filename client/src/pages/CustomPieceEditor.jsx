import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PieceDetails from "./PieceDetails.jsx";

const CustomPieceEditor = ({ pieces }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customItem, setCustomItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomItem = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/custom-items/${id}`);

        if (!response.ok) {
          const { error: message } = await response.json();
          throw new Error(message ?? `Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setCustomItem(data);
      } catch (err) {
        console.error("Unable to load custom piece:", err);
        setError(
          err.message ?? "We could not load this custom piece. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomItem();
  }, [id]);

  const basePiece = useMemo(() => {
    if (!customItem) return null;
    return pieces.find(
      (piece) => String(piece.id) === String(customItem.base_piece_id)
    );
  }, [pieces, customItem]);

  const handleSaveComplete = () => {
    navigate("/my-pieces");
  };

  if (loading) {
    return (
      <main className="content">
        <div className="status status--loading">Loading custom piece…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="content">
        <div className="status status--error" role="alert">
          {error}
        </div>
      </main>
    );
  }

  if (!customItem || !basePiece) {
    return (
      <main className="content">
        <div className="status status--error" role="alert">
          We couldn&rsquo;t find the referenced base piece. It may have been removed.
        </div>
      </main>
    );
  }

  return (
    <PieceDetails
      key={customItem.id}
      pieces={pieces}
      customItem={customItem}
      onSaveComplete={handleSaveComplete}
      onDeleteComplete={handleSaveComplete}
    />
  );
};

export default CustomPieceEditor;
