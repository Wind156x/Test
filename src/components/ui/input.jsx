import React from "react";
export function Input({ ...props }) {
  return (
    <input
      style={{
        padding: "0.5rem",
        border: "1px solid #e5e7eb",
        borderRadius: "0.375rem",
        width: "100%",
        marginBottom: "0.5rem"
      }}
      {...props}
    />
  );
}