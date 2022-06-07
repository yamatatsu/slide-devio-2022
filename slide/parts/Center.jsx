import React from "react";

const style = {
  container: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
};

export const Center = ({ children }) => (
  <div style={style.container}>{children}</div>
);
