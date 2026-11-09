import getPort from 'get-port';
import WebSocket, { WebSocketServer } from 'ws';
import { log } from './log.js';

/**
 * @typedef {object} SendOptions
 * @property {boolean} [transform=true] - JSON-stringify the payload before sending
 * @property {WebSocket|null} [exclude=null] - Client that should not receive the payload
 * @property {WebSocket|null} [include=null] - Client that should receive the payload even if excluded
 */

/**
 * @typedef {object} FragmentWebSocketServer
 * @property {number} port
 * @property {(payload: object|string, options?: SendOptions) => void} send
 * @property {() => Promise<void>} close
 */

/**
 * @param {object} [params]
 * @param {number} [params.port]
 * @returns {Promise<FragmentWebSocketServer>}
 */
export async function createWebSocketServer({ port = 1234 } = {}) {
	port = await getPort({ port });

	let wss = new WebSocketServer({ port });

	log.info(`Starting WebSocket server...`);

	wss.on('connection', (socket) => {
		socket.on('message', (message) => {
			const json = JSON.parse(message.toString());

			send(json, {
				exclude: socket,
			});
		});

		send(
			{
				event: 'start',
				data: {
					clientCount: wss.clients.size - 1,
				},
			},
			{
				include: socket,
			},
		);

		send(
			{
				event: 'client-connect',
				data: {
					clientCount: wss.clients.size - 1,
				},
			},
			{
				exclude: socket,
			},
		);

		socket.on('close', () => {
			send(
				{
					event: 'client-disconnect',
					data: {
						clientCount: wss.clients.size - 1,
					},
				},
				{
					exclude: socket,
				},
			);
		});
	});

	wss.on('error', (e) => {
		const error = /** @type {NodeJS.ErrnoException} */ (e);

		if (error.code !== 'EADDRINUSE') {
			console.error(`WebSocket server error:\n${e.stack || e.message}`);
		}
	});

	/**
	 * @param {object|string} payload
	 * @param {SendOptions} [options]
	 * @returns {void}
	 */
	function send(
		payload,
		{ transform = true, exclude = null, include = null } = {},
	) {
		const stringified = transform
			? JSON.stringify(payload)
			: /** @type {string} */ (payload);

		wss.clients.forEach((client) => {
			if (
				client.readyState === WebSocket.OPEN &&
				(client !== exclude || client === include)
			) {
				client.send(stringified);
			}
		});
	}

	/**
	 * @returns {Promise<void>}
	 */
	function close() {
		return new Promise((resolve, reject) => {
			wss.close((err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	return {
		port,
		send,
		close,
	};
}
