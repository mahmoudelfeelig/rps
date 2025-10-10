import React from "react";

export const Input = ({ className = "", ...props }) => {
  const cls =
    "input " + className; // uses .input from index.css
  return <input className={cls} {...props} />;
};

export const Textarea = ({ className = "", rows = 4, ...props }) => {
  const cls =
    "w-full bg-white/5 text-white placeholder-white/50 rounded-xl px-3 py-2 " +
    "border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 " +
    className;
  return <textarea rows={rows} className={cls} {...props} />;
};
