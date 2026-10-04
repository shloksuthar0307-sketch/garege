const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "src");

const replacements = [
  { regex: /bg-black\/30(?![\w\-\/])/g, replacement: "bg-[var(--bg-input)]" },
  { regex: /bg-black\/40(?![\w\-\/])/g, replacement: "bg-[var(--bg-input)]" },
  { regex: /bg-black\/50(?![\w\-\/])/g, replacement: "bg-[var(--bg-input)]" },
  { regex: /bg-black\/60(?![\w\-\/])/g, replacement: "bg-[var(--bg-overlay)]" }, // overlays
];

function processDirectory(directory) {
  fs.readdirSync(directory).forEach(file => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith(".tsx")) {
      let content = fs.readFileSync(fullPath, "utf8");
      let original = content;
      replacements.forEach(({regex, replacement}) => {
        content = content.replace(regex, replacement);
      });
      if (content !== original) {
        fs.writeFileSync(fullPath, content, "utf8");
      }
    }
  });
}

processDirectory(directoryPath);
console.log("Input refactor complete.");
