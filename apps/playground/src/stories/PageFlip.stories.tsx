import type { Meta, StoryObj } from "@storybook/react";

import {
	PageFlip,
	usePageFlip,
	usePageFlipControls,
	usePageFlipState,
} from "@pageflip/react";
import "@pageflip/theme";

const meta: Meta<typeof PageFlip> = {
	title: "PageFlip/PageFlip",
	component: PageFlip,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: "Main PageFlip component for interactive flip books.",
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		width: { control: "number", description: "Page width in pixels" },
		height: { control: "number", description: "Page height in pixels" },
		size: { control: "select", options: ["fixed", "stretch"] },
		flippingTime: {
			control: "number",
			description: "Flip animation duration (ms)",
		},
		drawShadow: { control: "boolean" },
		maxShadowOpacity: {
			control: { type: "range", min: 0, max: 1, step: 0.1 },
		},
		showCover: { control: "boolean" },
		usePortrait: { control: "boolean" },
	},
};

export default meta;

type Story = StoryObj<typeof PageFlip>;

export const Default: Story = {
	args: {
		width: 600,
		height: 450,
		size: "stretch",
		showCover: true,
		drawShadow: true,
		flippingTime: 1000,
	},
	render: (args) => (
		<PageFlip {...args}>
			<div className="page">Page 1</div>
			<div className="page">Page 2</div>
			<div className="page">Page 3</div>
		</PageFlip>
	),
};

export const FixedSize: Story = {
	args: {
		width: 400,
		height: 300,
		size: "fixed",
		showCover: false,
	},
	render: (args) => (
		<PageFlip {...args}>
			<div className="page">Fixed Page 1</div>
			<div className="page">Fixed Page 2</div>
		</PageFlip>
	),
};

export const WithControls: Story = {
	args: {
		width: 500,
		height: 350,
		size: "stretch",
		showCover: true,
	},
	render: () => {
		const { instance, ref } = usePageFlip({
			width: 500,
			height: 350,
			size: "stretch",
			showCover: true,
		});
		const controls = usePageFlipControls(instance);
		const state = usePageFlipState(instance);

		return (
			<div>
				<div ref={ref}>
					<div className="page">Page 1</div>
					<div className="page">Page 2</div>
					<div className="page">Page 3</div>
				</div>
				<div
					style={{
						marginTop: "1rem",
						display: "flex",
						gap: "0.5rem",
						justifyContent: "center",
					}}
				>
					<button
						onClick={() => void controls.prev()}
						disabled={state.currentPage === 0}
						type="button"
					>
						Prev
					</button>
					<span>
						{state.currentPage + 1} / {Math.max(state.pageCount, 1)}
					</span>
					<button
						onClick={() => void controls.next()}
						disabled={state.currentPage >= state.pageCount - 1}
						type="button"
					>
						Next
					</button>
				</div>
			</div>
		);
	},
};
