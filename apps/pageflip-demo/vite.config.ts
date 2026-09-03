import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@pageflip/core": path.resolve(__dirname, "../../packages/core/src"),
			"@pageflip/react": path.resolve(__dirname, "../../packages/react/src"),
			"@pageflip/theme": path.resolve(__dirname, "../../packages/theme/src"),
		},
	},
	server: {
		port: 5174,
		open: false,
	},
	build: {
		outDir: "dist",
		sourcemap: true,
	},
});
