import React from "react";

const Option = ({ value, label }) => <option value={value}>{label}</option>;

const Select = ({ className = "", options = [], ...props }) => {
  return (
    <select className={["select", className].join(" ")} {...props}>
      {options.map((o) => (
        <Option key={o.value} value={o.value} label={o.label} />
      ))}
    </select>
  );
};

export default Select;
