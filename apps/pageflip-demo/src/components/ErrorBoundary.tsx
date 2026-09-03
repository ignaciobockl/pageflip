import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	error: Error | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo): void {
		console.error("PageFlip Demo error:", error, info.componentStack);
	}

	render(): ReactNode {
		if (this.state.error) {
			return (
				<div className="error-boundary" role="alert">
					<h2>Algo salio mal</h2>
					<p>{this.state.error.message}</p>
					<pre>{this.state.error.stack ?? ""}</pre>
				</div>
			);
		}

		return this.props.children;
	}
}
