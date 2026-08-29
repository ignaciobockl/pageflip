const tsParser = require("@typescript-eslint/parser");

module.exports = [
	{
		ignores: ["dist/**", "node_modules/**"],
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parser: tsParser,
			parserOptions: {
				project: ["./tsconfig.eslint.json"],
				tsconfigRootDir: __dirname,
			},
		},
		rules: {},
	},
];
