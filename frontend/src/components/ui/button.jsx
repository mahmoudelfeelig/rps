import React from "react";

const variants = {
  primary: "bg-pink-500 hover:bg-pink-600 text-white",
  secondary: "bg-white/10 hover:bg-white/20 text-white",
  outline: "bg-transparent border border-white/20 hover:bg-white/10 text-white",
  ghost: "bg-transparent hover:bg-white/10 text-white",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = ({ children, className = "", variant = "primary", size = "md", ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-xl font-semibold transition focus-visible:ring-2 focus-visible:ring-pink-500";
  const cls = [base, variants[variant] || variants.primary, sizes[size] || sizes.md, className]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
};
