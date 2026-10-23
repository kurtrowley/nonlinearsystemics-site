// Publishes the redirect page: copies the three files GitHub Pages serves into dist/.
import { copyFileSync, mkdirSync } from "node:fs";
mkdirSync("dist", { recursive: true });
for (const f of ["index.html", "404.html", "CNAME"]) copyFileSync(f, "dist/" + f);
