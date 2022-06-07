import React from "react";
import { Avatar } from "./Avatar";

const styles = {
  line: {
    height: 2,
    width: "100%",
    backgroundColor: "white",
  },
  list: {
    listStyleType: "none",
  },
  name: {
    fontSize: 36,
    fontWeight: 700,
  },
  company: {
    fontSize: 30,
    marginBottom: "24px",
  },

  listItemSub: {
    fontSize: 20,
    marginBottom: "8px",
  },
  content: {
    display: "flex",
    alignItems: "center",
  },
};

export const Profile = () => (
  <div>
    <div style={styles.line} />
    <div style={styles.content}>
      <Avatar />
      <ul style={styles.list}>
        <li style={styles.name}>山本達也（やまたつ）</li>
        <li style={styles.company}>@Classmethod</li>
        <li style={styles.listItemSub}>
          <a href="https://twitter.com/yamatatsu193">Twitter: @yamatatsu193</a>
        </li>
        <li style={styles.listItemSub}>
          <a href="https://github.com/yamatatsu">GitHub: @yamatatsu</a>
        </li>
      </ul>
    </div>
    <div style={styles.line} />
  </div>
);
