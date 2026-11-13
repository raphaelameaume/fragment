/**
 * @typedef {Object} MessagePayload
 * @property {string} event - The event name
 * @property {any} [data] - Optional event data
 */

/**
 * @typedef {Object} ShaderWarning
 * @property {string} type - Warning type
 * @property {string} importer - File that imported the shader
 * @property {string} message - Warning message
 * @property {Object} location - Location of the warning
 * @property {string} location.lineText - The line of code with the warning
 */

/**
 * @typedef {Object} ShaderUpdate
 * @property {ShaderWarning[]} [warnings] - Array of shader warnings
 */

/**
 * @typedef {Object} SketchUpdate
 * @property {string} filepath
 */

/**
 * @callback EventCallback
 * @param {any} data - Event data
 * @returns {void}
 */

/**
 * @callback UnsubscribeFunction
 * @returns {void}
 */

const socketProtocol = location.protocol === 'https:' ? 'wss' : 'ws';
const socketHost = `${location.hostname}:${__FRAGMENT_PORT__}`;

/** @type {WebSocket | undefined} */
let socket;
/** @type {Record<string, EventCallback[]>} */
let listeners = {};
let opened = false;

/**
 * Handle incoming WebSocket message
 * @param {MessagePayload} payload - The message payload
 * @returns {void}
 */
function handleMessage(payload) {
	const { event, data = {} } = payload;
	const callbacks = listeners[event];

	if (callbacks && callbacks.length) {
		callbacks.forEach((cb) => cb(data));
	}
}

/**
 * Subscribe to an event
 * @param {string} event - The event name to listen for
 * @param {EventCallback} cb - The callback function
 * @returns {UnsubscribeFunction} Function to unsubscribe
 */
function on(event, cb) {
	if (!listeners[event]) {
		listeners[event] = [];
	}

	listeners[event].push(cb);

	return () => {
		off(event, cb);
	};
}

/**
 * Unsubscribe from an event
 * @param {string} event - The event name
 * @param {EventCallback} cb - The callback function to remove
 * @returns {void}
 */
function off(event, cb) {
	const callbacks = listeners[event];

	if (callbacks && callbacks.length) {
		const filtered = callbacks.filter((callback) => callback !== cb);

		listeners[event] = filtered;
	}
}

/**
 * Emit an event to the server
 * @param {string} event - The event name
 * @param {any} data - The data to send
 * @returns {void}
 */
function emit(event, data) {
	if (socket && opened) {
		socket.send(
			JSON.stringify({
				event,
				data,
			}),
		);
	}
}

if (import.meta.hot) {
	console.log('[fragment] connecting...');

	socket = new WebSocket(`${socketProtocol}://${socketHost}`);

	socket.addEventListener('message', (message) => {
		const { data } = message;

		handleMessage(JSON.parse(data));
	});

	socket.addEventListener('open', () => {
		console.log('[fragment] connected.');
		opened = true;
	});

	import.meta.hot.on(
		'sketch-update',
		/** @param {SketchUpdate} sketchUpdate */
		(sketchUpdate) => {
			console.log(`[fragment] hmr update /${sketchUpdate.filepath}`);
		},
	);
}

/**
 * Client API for WebSocket communication
 * @type {{ on: typeof on, off: typeof off, emit: typeof emit }}
 */
export const client = { on, off, emit };

client.on('shader-update', (shaderUpdates) => {
	shaderUpdates.forEach(
		/** @param {ShaderUpdate} shaderUpdate */
		({ warnings = [] } = {}) => {
			if (warnings.length > 0) {
				warnings.forEach((warning) => {
					const { location } = warning;
					console.warn(
						`[fragment-plugin-hsr] ${warning.type} ${warning.importer}\n\n  ${location.lineText}\n\n${warning.message}`,
					);
				});
			}
		},
	);
});
