export default {
  files: "./src/*.test.js", // Your test files
  testRunnerHtml: (testFramework) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="./index.min.js"></script>
        <script src="https://unpkg.com/sinon/pkg/sinon.js"></script>
        <script type="module">
          import * as chai from "https://unpkg.com/chai@5.1.0/chai.js";

          window.chai = chai;
          window.expect = chai.expect;
        </script>
      </head>
      <body>
        <script type="module" src="${testFramework}"></script>
      </body>
      </html>
    `;
  },
  nodeResolve: true,
};
