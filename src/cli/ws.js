import fs from "fs";
import path from "path";
import getPort from 'get-port';
import log from "./log.js";
import WebSocket, { WebSocketServer } from 'ws';
import db from "./db.js";

export async function start({
    port = 1234,
    cwd = "",
} = {}) {
    port = await getPort({ port });

    let wss = new WebSocketServer({ port });

    wss.on('connection', (socket) => {
        log.warning("Client connected");
        socket.on('message', (message) => {
            const json = JSON.parse(message);
            const { event, data } = json;
            
            if (event === "screenshot") {
                fs.writeFile(path.join(cwd, data.filename), Buffer.from(data.content.replace(/^data:image\/\w+;base64,/, ''), 'base64'), (error) => {
                    console.log(error);
                });
            }

            if (event === "save") {
                const { key, value } = data;
                db.save(key, value);
            }

            send(json, {
                sender: socket
            });
        });

        // if (bufferedError) {
        //     socket.send(JSON.stringify(bufferedError))
        //     bufferedError = null
        // }
    });

    wss.on('error', (e) => {
        if (e.code !== 'EADDRINUSE') {
            console.error(`WebSocket server error:\n${e.stack || e.message}`);
        }
    });

    function send(payload, { transform = true, sender = null } = {}) {
        const stringified = transform ? JSON.stringify(payload) : payload;

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client !== sender) {
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
                        reject(err)
                    } else {
                        resolve()
                    }
                });
            });
        }
    };
}
