import React from "react";

export const Input = ({ className = "", ...props }) => {
  return <input className={["input", className].join(" ")} {...props} />;
};

export const Textarea = ({ className = "", rows = 4, ...props }) => {
  return (
    <textarea
      rows={rows}
      className={[
        "w-full bg-white/5 text-white placeholder-white/50 rounded-xl px-3 py-2",
        "border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500",
        className,
      ].join(" ")}
      {...props}
    />
  );
};
