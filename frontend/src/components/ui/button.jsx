export const Button = ({ children, className = '', ...props }) => (
    <button className={`bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-2xl transition-all ${className}`} {...props}>
      {children}
    </button>
  );
  