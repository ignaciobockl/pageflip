const tsParser = require("@typescript-eslint/parser");

module.exports = [
	{
		ignores: ["dist/**", "node_modules/**"],
	},
	{
		files: ["**/*.ts"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parser: tsParser,
		},
		rules: {},
	},
];
