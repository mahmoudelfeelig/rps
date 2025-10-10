import React from "react";
import { cn } from "../../lib/utils";

const Container = ({ className = "", children }) => (
  <div className={cn("container", className)}>{children}</div>
);

export default Container;
