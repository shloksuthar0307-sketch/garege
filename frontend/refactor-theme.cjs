const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "src");

const replacements = [
  { regex: /bg-\[\#020202\]/g, replacement: "bg-[var(--bg-root)]" },
  { regex: /bg-\[\#0A0A0B\]/g, replacement: "bg-[var(--bg-primary)]" },
  { regex: /bg-\[\#111112\]/g, replacement: "bg-[var(--bg-secondary)]" },
  { regex: /bg-black\/80/g, replacement: "bg-[var(--bg-overlay)]" },
  { regex: /bg-white\/5/g, replacement: "bg-[var(--bg-surface-hover)]" },
  { regex: /bg-white\/10/g, replacement: "bg-[var(--bg-surface-active)]" },
  
  { regex: /text-white(?![\w\-\/])/g, replacement: "text-[var(--text-primary)]" },
  { regex: /text-slate-200/g, replacement: "text-[var(--text-secondary)]" },
  { regex: /text-slate-300/g, replacement: "text-[var(--text-secondary)]" },
  { regex: /text-slate-400/g, replacement: "text-[var(--text-muted)]" },
  { regex: /text-slate-500/g, replacement: "text-[var(--text-muted)]" },
  
  { regex: /border-white\/5(?![\w\-\/])/g, replacement: "border-[var(--border-subtle)]" },
  { regex: /border-white\/10(?![\w\-\/])/g, replacement: "border-[var(--border-default)]" },
  { regex: /border-white\/20(?![\w\-\/])/g, replacement: "border-[var(--border-strong)]" },
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
console.log("Refactor complete.");
