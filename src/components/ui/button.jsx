export function Button({ children, onClick, className = "", variant, ...props }) {
  let style = {
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    border: "none",
    background: variant === "outline" ? "#fff" : "#3b82f6",
    color: variant === "outline" ? "#3b82f6" : "#fff",
    cursor: "pointer",
    fontWeight: 500,
    margin: "2px"
  };
  if (className?.includes("bg-red-500")) style.background = "#ef4444";
  if (className?.includes("bg-green-500")) style.background = "#22c55e";
  if (className?.includes("bg-gray-500")) style.background = "#6b7280";
  if (className?.includes("text-white")) style.color = "#fff";
  return (
    <button className={className} style={style} onClick={onClick} {...props}>
      {children}
    </button>
  );
}