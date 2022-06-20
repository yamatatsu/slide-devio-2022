import * as React from "react";

export const TitleBackground = ({ children }) => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundImage: "url(./parts/assets/title-background.png)",
        backgroundSize: "cover",
      }}
    >
      {children}
    </div>
  );
};
