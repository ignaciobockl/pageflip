# Benchmark

Internal benchmark app for PageFlip core hot paths.

Current benchmarks:

- `LayoutCalculator.calculate`
- `calculateFoldCurve`
- `calculateFoldAngle`
- `quadraticBezierPoint`

Run locally:

```bash
bun run --filter=@pageflip/benchmark test
```

Outputs are written to `dist/benchmark-results.json`.
