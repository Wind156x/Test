import React from "react";
export function Card({ children }) {
  return <div style={{
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    background: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
  }}>{children}</div>;
}

export function CardContent({ children, className }) {
  return <div className={className}>{children}</div>;
}