import React from "react";

export const Avatar = () => (
  <img
    src={require("file-loader!./assets/yamatatsu.png")}
    height="120"
    width="120"
    style={{ borderRadius: 60 }}
  />
);
