import * as React from "react";

export const NormalBackground = ({ children }) => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url(./parts/assets/logo.png)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right bottom",
      }}
    >
      {children}
    </div>
  );
};
