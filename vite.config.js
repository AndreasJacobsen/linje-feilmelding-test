import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages serves the site from /linje-feilmelding-test/.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/linje-feilmelding-test/" : "/",
  plugins: [react()],
}));
