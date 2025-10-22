// client/src/utils/formatLabel.jsx
const formatLabel = (value) =>
  String(value ?? "")
    .split(/[\s_-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default formatLabel;
