const tsParser = require("@typescript-eslint/parser");

module.exports = [
	{
		ignores: [
			"**/dist/**",
			"**/coverage/**",
			"**/.turbo/**",
			"**/node_modules/**",
			"**/*.config.cjs",
			"**/*.config.js",
			"**/playwright.config.ts",
			"**/vite.config.ts",
			"**/*.d.ts",
		],
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parser: tsParser,
		},
		rules: {},
	},
];
