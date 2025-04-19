export const Select = ({ onValueChange, value, children }) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="p-2 border rounded w-full"
    >
      {children}
    </select>
  );
};

export const SelectTrigger = ({ children }) => <>{children}</>;
export const SelectValue = ({ placeholder }) => <>{placeholder}</>;
export const SelectContent = ({ children }) => <>{children}</>;
export const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);