import type { Preview } from "@storybook/react";
import "@pageflip/theme";

import "../src/App.css";

const preview: Preview = {
	parameters: {
		actions: { argTypesRegex: "^on[A-Z].*" },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			default: "light",
			values: [
				{ name: "light", value: "#ffffff" },
				{ name: "dark", value: "#1a1a2e" },
				{ name: "gray", value: "#f5f5f5" },
			],
		},
		layout: "centered",
	},
	globalTypes: {
		theme: {
			description: "Global theme for components",
			defaultValue: "light",
			toolbar: {
				title: "Theme",
				icon: "circlehollow",
				items: ["light", "dark"],
				dynamicTitle: true,
			},
		},
	},
	decorators: [
		(Story, context) => {
			const theme = context.globals.theme;

			return (
				<div
					data-theme={theme}
					className="storybook-wrapper"
					style={{ padding: "1rem" }}
				>
					<Story />
				</div>
			);
		},
	],
};

export default preview;
