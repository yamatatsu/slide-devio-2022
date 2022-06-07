import * as React from "react";

export const Header = ({ children }) => {
  return (
    <header
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        background: "black",
        display: "flex",
        paddingLeft: 24,
        alignItems: "center",
      }}
    >
      <h3 style={{ color: "white" }}>{children}</h3>
    </header>
  );
};
