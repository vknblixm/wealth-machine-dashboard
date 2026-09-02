const fs = require("fs");
const c = fs.readFileSync("wealth-machine-dashboard/app/page.tsx", "utf8");
const idx = c.indexOf("label: 'Real Prospects");
if (idx < 0) { console.log("not found"); process.exit(1); }
const before = c.substring(0, idx);
const rest = fs.readFileSync("wealth-machine-dashboard/_rest.tsx", "utf8");
fs.writeFileSync("wealth-machine-dashboard/app/page.tsx", before + rest);
console.log("Fixed!", (before + rest).length, "bytes");