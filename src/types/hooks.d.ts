declare module '@fragment/hooks' {
	type Listener = (params: {
		encoding: string;
		quality: number;
		count: number;
		index: number;
		pixelsPerInch: number;
	}) => Function | void;

	function onBeforeCapture(listener: Listener, context?: string): void;
	function onAfterCapture(listener: Listener, context?: string): void;
	function onBeforeRecord(listener: Listener, context?: string): void;
	function onAfterRecord(listener: Listener, context?: string): void;
}
