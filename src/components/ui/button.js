export const Button = ({ onClick, children, className, variant, disabled }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded ${variant === 'outline' ? 'border' : 'bg-blue-500 text-white'} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};