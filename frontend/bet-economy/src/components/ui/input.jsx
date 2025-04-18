export const Input = ({ value, onChange, placeholder, className = '', ...props }) => {
    return (
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-dark-100 text-white px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition ${className}`}
        {...props}
      />
    );
  };
  