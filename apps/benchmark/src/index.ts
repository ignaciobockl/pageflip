import {
	calculateFoldAngle,
	calculateFoldCurve,
	quadraticBezierPoint,
} from "../../../packages/core/src/engine/bezier";
import { LayoutCalculator } from "../../../packages/core/src/layout/LayoutCalculator";

type BenchmarkResult = {
	name: string;
	iterations: number;
	elapsedMs: number;
	opsPerSecond: number;
};

const layoutCalculator = new LayoutCalculator();

const containerRect = {
	x: 0,
	y: 0,
	width: 1280,
	height: 720,
};

const pageConfig = {
	width: 800,
	height: 600,
	size: "stretch" as const,
	usePortrait: true,
	showCover: true,
};

const point0 = { x: 0, y: 0 };
const point1 = { x: 320, y: 240 };
const point2 = { x: 640, y: 0 };

function benchmark(
	name: string,
	iterations: number,
	run: () => void,
): BenchmarkResult {
	const start = performance.now();

	for (let index = 0; index < iterations; index += 1) {
		run();
	}

	const elapsedMs = performance.now() - start;
	const opsPerSecond = iterations / (elapsedMs / 1000);

	return {
		name,
		iterations,
		elapsedMs,
		opsPerSecond,
	};
}

const results = [
	benchmark("layout.calculate", 50_000, () => {
		layoutCalculator.calculate(containerRect, pageConfig);
	}),
	benchmark("bezier.fold-curve", 100_000, () => {
		calculateFoldCurve(containerRect, "top", 0.5, 42);
	}),
	benchmark("bezier.fold-angle", 100_000, () => {
		calculateFoldAngle(containerRect, "top", { x: 320, y: 120 });
	}),
	benchmark("bezier.quadratic-point", 200_000, () => {
		quadraticBezierPoint(0.5, point0, point1, point2);
	}),
];

const reportPath = new URL("../dist/benchmark-results.json", import.meta.url);

await Bun.write(reportPath, `${JSON.stringify(results, null, 2)}\n`);

console.table(
	results.map((result) => ({
		benchmark: result.name,
		iterations: result.iterations,
		elapsedMs: Number(result.elapsedMs.toFixed(2)),
		opsPerSecond: Number(result.opsPerSecond.toFixed(2)),
	})),
);
