import { useState } from "react";

export function Select({ children, onValueChange, value }) {
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      {children &&
        React.Children.map(children, (child) =>
          React.cloneElement(child, { onValueChange, value })
        )}
    </div>
  );
}
export function SelectTrigger({ children }) {
  return <div>{children}</div>;
}
export function SelectValue({ placeholder }) {
  return <span style={{ color: "#6b7280" }}>{placeholder}</span>;
}
export function SelectContent({ children }) {
  return <div>{children}</div>;
}
export function SelectItem({ children, value, onValueChange }) {
  return (
    <div
      onClick={() => onValueChange && onValueChange(value)}
      style={{
        padding: "0.5rem",
        cursor: "pointer",
        borderBottom: "1px solid #f1f1f1",
        background: "#fff"
      }}
    >
      {children}
    </div>
  );
}