export const Input = ({ placeholder, type, value, onChange, required }) => {
  return (
    <input
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="p-2 border rounded w-full"
    />
  );
};