declare module '@fragment/hooks' {
	type Parameters = {
		name: string;
		exportDir: string;
		params: Record<string, any>;
	};
	type CaptureParameters = Parameters & {
		encoding: string;
		quality: number;
		count: number;
		index: number;
		pixelsPerInch: number;
	};
	type RecordParameters = Parameters & {
		encoding: string;
		quality: number;
		framerate: number;
	};

	type Listener<P extends Parameters> = (parameters: P) => Function | void;
	type CaptureListener = Listener<CaptureParameters>;
	type RecordListener = Listener<RecordParameters>;

	function onBeforeCapture(listener: CaptureListener, context?: string): void;
	function onAfterCapture(listener: CaptureListener, context?: string): void;
	function onBeforeRecord(listener: RecordListener, context?: string): void;
	function onAfterRecord(listener: RecordListener, context?: string): void;
}
