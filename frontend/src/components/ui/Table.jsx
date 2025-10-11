import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className={'overflow-x-auto ' + className}>
      <table className="table-std">{children}</table>
    </div>
  );
}
export function THead({ children }) {
  return <thead className="text-left text-gray-300">{children}</thead>;
}
export function TH({ children, className = '' }) {
  return <th className={'px-3 py-2 text-xs font-semibold ' + className}>{children}</th>;
}
export function TBody({ children }) {
  return <tbody>{children}</tbody>;
}
export function TR({ children, className = '' }) {
  return <tr className={'bg-white/5 hover:bg-white/10 transition rounded-xl ' + className}>{children}</tr>;
}
export function TD({ children, className = '' }) {
  return <td className={'px-3 py-3 text-sm text-white/90 ' + className}>{children}</td>;
}
