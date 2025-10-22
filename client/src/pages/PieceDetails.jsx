import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import formatLabel from "../utils/formatLabel.jsx";

const BOARD_OPTIONS = [
  {
    id: "classic",
    value: "green",
    label: "Classic",
    image: "/boards/classic.png",
  },
  {
    id: "black-white",
    value: "black-white",
    label: "Black/White",
    image: "/boards/black-white.jpg",
  },
  {
    id: "wooden",
    value: "wooden",
    label: "Wooden",
    image: "/boards/wooden.webp",
  },
];

const MATERIAL_OPTIONS = [
  { value: "glass", label: "Glass" },
  { value: "stone", label: "Stone" },
  { value: "wood", label: "Wood" },
];

const findBoardOption = (board) => {
  const normalized = (board ?? "").toLowerCase();
  return (
    BOARD_OPTIONS.find(
      (option) => option.value === normalized || option.id === normalized
    ) ?? BOARD_OPTIONS[0]
  );
};

const PieceDetails = ({
  pieces,
  customItem = null,
  onSaveComplete,
  onDeleteComplete,
}) => {
  const navigate = useNavigate();
  const { id: routeId } = useParams();

  const basePieceId = useMemo(() => {
    if (customItem?.base_piece_id) {
      return String(customItem.base_piece_id);
    }
    return routeId;
  }, [customItem, routeId]);

  const isEditing = Boolean(customItem);

  const piece = useMemo(
    () => pieces.find((item) => String(item.id) === String(basePieceId)),
    [pieces, basePieceId]
  );

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedBoard, setSelectedBoard] = useState(BOARD_OPTIONS[0].value);
  const [selectedMaterial, setSelectedMaterial] = useState("wood");
  const [customName, setCustomName] = useState(customItem?.custom_name ?? "");
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const variants = useMemo(() => {
    if (!piece) return [];
    return pieces.filter(
      (candidate) => candidate.name.toLowerCase() === piece.name.toLowerCase()
    );
  }, [piece, pieces]);

  const normalizedSelectedColor = (selectedColor ?? "").toLowerCase();

  const colors = useMemo(() => {
    return Array.from(
      new Set(
        variants.map((variant) =>
          (variant.pieceColor ?? variant.piececolor ?? "").toLowerCase()
        )
      )
    ).filter(Boolean);
  }, [variants]);

  const variantsForColor = useMemo(() => {
    if (!piece) return [];
    if (!normalizedSelectedColor) return variants;
    return variants.filter(
      (variant) =>
        (variant.pieceColor ?? variant.piececolor ?? "").toLowerCase() ===
        normalizedSelectedColor
    );
  }, [piece, variants, normalizedSelectedColor]);

  const materials = useMemo(() => {
    return Array.from(
      new Set(
        variantsForColor.map((variant) =>
          (variant.material ?? "wood").toLowerCase()
        )
      )
    ).filter(Boolean);
  }, [variantsForColor]);

  const availableMaterialOptions = useMemo(() => {
    const materialSet = new Set(materials);
    const filtered = MATERIAL_OPTIONS.filter((option) =>
      materialSet.has(option.value)
    );
    return filtered.length > 0 ? filtered : MATERIAL_OPTIONS;
  }, [materials]);

  useEffect(() => {
    if (!piece) return;

    const defaultColor = (
      (isEditing ? customItem?.selected_color : piece.pieceColor) ?? ""
    ).toLowerCase();
    const defaultBoard = (
      (isEditing ? customItem?.selected_board : piece.chessboard) ?? ""
    ).toLowerCase();
    const defaultMaterial = (
      (isEditing ? customItem?.selected_material : piece.material) ?? "wood"
    ).toLowerCase();

    const resolvedColor = colors.includes(defaultColor)
      ? defaultColor
      : colors[0] ?? defaultColor;

    const boardValues = BOARD_OPTIONS.map((option) => option.value);
    const resolvedBoard = boardValues.includes(defaultBoard)
      ? defaultBoard
      : boardValues[0] ?? defaultBoard;

    const resolvedMaterial = materials.includes(defaultMaterial)
      ? defaultMaterial
      : materials[0] ?? defaultMaterial;

    const currentColor = (selectedColor ?? "").toLowerCase();
    const currentBoard = (selectedBoard ?? "").toLowerCase();
    const currentMaterial = (selectedMaterial ?? "").toLowerCase();

    if (!colors.includes(currentColor)) {
      setSelectedColor(resolvedColor || "");
    }

    if (!boardValues.includes(currentBoard)) {
      setSelectedBoard(resolvedBoard || BOARD_OPTIONS[0].value);
    }

    if (!materials.includes(currentMaterial)) {
      setSelectedMaterial(resolvedMaterial || "wood");
    }
  }, [
    piece,
    colors,
    materials,
    isEditing,
    customItem?.selected_board,
    customItem?.selected_color,
    customItem?.selected_material,
    selectedBoard,
    selectedColor,
    selectedMaterial,
  ]);

  useEffect(() => {
    if (!isEditing || !customItem?.custom_name) return;
    setCustomName(customItem.custom_name);
  }, [isEditing, customItem?.custom_name]);

  const activeBoardOption = useMemo(
    () =>
      BOARD_OPTIONS.find((option) => option.value === selectedBoard) ??
      findBoardOption(selectedBoard),
    [selectedBoard]
  );

  const exactVariant = useMemo(() => {
    if (!piece) return null;

    const color = selectedColor?.toLowerCase() ?? "";
    const material = (selectedMaterial ?? "wood").toLowerCase();

    return (
      variants.find(
        (variant) =>
          (variant.pieceColor ?? "").toLowerCase() === color &&
          (variant.material ?? "wood").toLowerCase() === material
      ) ?? null
    );
  }, [variants, piece, selectedColor, selectedMaterial]);

  const previewVariant = useMemo(() => {
    if (exactVariant) return exactVariant;
    if (!piece) return null;

    const color = selectedColor?.toLowerCase() ?? "";

    return (
      variants.find(
        (variant) => (variant.pieceColor ?? "").toLowerCase() === color
      ) ?? piece
    );
  }, [exactVariant, variants, piece, selectedColor]);

  useEffect(() => {
    if (!piece || isEditing) return;
    setCustomName(
      `${formatLabel(piece.name)} – ${formatLabel(
        selectedColor || piece.pieceColor
      )}`
    );
  }, [piece, selectedColor, isEditing]);

  const handleSave = async () => {
    if (!piece || !exactVariant) {
      setSaveError("Please choose a valid combination.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    const payload = {
      base_piece_id: exactVariant?.id ?? piece.id,
      custom_name: customName,
      selected_color: selectedColor,
      selected_board: selectedBoard,
      selected_material: selectedMaterial,
      price: Number(exactVariant.price ?? piece.price ?? 0),
      image_path:
        exactVariant.image_path ??
        customItem?.image_path ??
        piece.image_path,
    };

    try {
      const endpoint = isEditing
        ? `/api/custom-items/${customItem.id}`
        : "/api/custom-items";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setSaveError(error ?? "Could not save custom piece.");
        return;
      }

      await response.json();

      if (onSaveComplete) {
        onSaveComplete();
      } else {
        navigate("/my-pieces");
      }

    } catch (error) {
      console.error(error);
      setSaveError("Unexpected error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !customItem) return;

    const confirmed = window.confirm(
      `Delete "${customItem.custom_name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/custom-items/${customItem.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const { error } = await response.json();
        setSaveError(error ?? "Could not delete custom piece.");
        return;
      }

      if (onDeleteComplete) {
        onDeleteComplete();
      } else {
        navigate("/my-pieces");
      }
    } catch (error) {
      console.error(error);
      setSaveError("Unexpected error while deleting.");
    } finally {
      setDeleting(false);
    }
  };

  if (!piece) return <p>Piece not found.</p>;

  return (
    <div className="piece-detail">
      <h1>{formatLabel(piece.name)}</h1>

      <div className="piece-detail__preview">
        <img
          src={previewVariant?.imageUrl ?? piece.imageUrl}
          alt={`${formatLabel(selectedColor || piece.pieceColor)} ${formatLabel(
            piece.name
          )}`}
        />
      </div>

      <div className="piece-detail__form">
        <label>
          Custom name
          <input
            type="text"
            value={customName}
            onChange={(event) => setCustomName(event.target.value)}
          />
        </label>

        <label>
          Color
          <select
            value={selectedColor}
            onChange={(event) => setSelectedColor(event.target.value)}
          >
            {colors.map((color) => (
              <option key={color} value={color}>
                {formatLabel(color)}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="piece-detail__material-field">
          <legend>Material</legend>
          <div className="piece-detail__material-options">
            {availableMaterialOptions.map((option) => {
              const isSelected = selectedMaterial === option.value;
              return (
                <label
                  key={option.value}
                  className={`piece-detail__material-choice${
                    isSelected ? " piece-detail__material-choice--active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="custom-material"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => setSelectedMaterial(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="piece-detail__board-field">
          <legend>Board</legend>
          <div className="piece-detail__board-options">
            {BOARD_OPTIONS.map((option) => {
              const isSelected = selectedBoard === option.value;
              return (
                <label
                  key={option.value}
                  className={`piece-detail__board-choice${
                    isSelected ? " piece-detail__board-choice--active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="custom-board"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => setSelectedBoard(option.value)}
                  />
                  <img
                    src={option.image}
                    alt={`${option.label} board option`}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
          <figure className="piece-detail__board-preview">
            <img
              src={activeBoardOption.image}
              alt={`${activeBoardOption.label} board preview`}
            />
            <figcaption>{activeBoardOption.label} board</figcaption>
          </figure>
        </fieldset>
      </div>

      <p className="piece-detail__description">
        {previewVariant?.description ?? piece.description}
      </p>
      <p className="piece-detail__price">
        ${Number(previewVariant?.price ?? piece.price).toFixed(2)}
      </p>

      {saveError && <p className="piece-detail__error">{saveError}</p>}

      <div className="piece-detail__actions">
        <button
          type="button"
          className="piece-detail__save"
          onClick={handleSave}
          disabled={saving || deleting}
        >
          {saving ? "Saving…" : isEditing ? "Update Custom Piece" : "Save Custom Piece"}
        </button>
        {isEditing && (
          <button
            type="button"
            className="piece-detail__delete"
            onClick={handleDelete}
            disabled={saving || deleting}
          >
            {deleting ? "Deleting…" : "Delete Custom Piece"}
          </button>
        )}
      </div>
    </div>
  );
};

export default PieceDetails;
