import React from "react";

const Option = ({ value, label }) => <option value={value}>{label}</option>;

const Select = ({ className = "", options = [], ...props }) => {
  const cls = "select " + className; // uses .select from index.css
  return (
    <select className={cls} {...props}>
      {options.map((o) => (
        <Option key={o.value} value={o.value} label={o.label} />
      ))}
    </select>
  );
};

export default Select;
