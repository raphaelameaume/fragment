import fs from 'fs';
import path from 'path';
import getPort from 'get-port';
import log from './log.js';
import WebSocket, { WebSocketServer } from 'ws';
import db from './db.js';

export async function start({ port = 1234, cwd = '' } = {}) {
	port = await getPort({ port });

	let wss = new WebSocketServer({ port });

	wss.on('connection', (socket) => {
		socket.on('message', (message) => {
			const json = JSON.parse(message);
			const { event, data } = json;

			if (event === 'save') {
				const { key, value } = data;
				db.save(key, value);
			}

			send(json, {
				sender: socket,
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
		if (e.code !== 'EADDRINUSE') {
			console.error(`WebSocket server error:\n${e.stack || e.message}`);
		}
	});

	function send(
		payload,
		{ transform = true, exclude = null, include = null } = {},
	) {
		const stringified = transform ? JSON.stringify(payload) : payload;

		wss.clients.forEach((client) => {
			if (
				client.readyState === WebSocket.OPEN &&
				(client !== exclude || client === include)
			) {
				client.send(stringified);
			}
		});
	}

	return {
		port,
		send,
		close: () => {
			return new Promise((resolve, reject) => {
				wss.close((err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		},
	};
}
