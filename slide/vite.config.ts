export default {
  plugins: [CustomHmr()],
};

function CustomHmr() {
  return {
    name: "md-hmr",
    enforce: "post",
    // HMR
    handleHotUpdate({ file, server }) {
      if (/\/md\/[\d\w-]+.md$/.test(file)) {
        console.log("reloading md file...");

        server.ws.send({
          type: "full-reload",
          path: "*",
        });
      }
    },
  };
}
