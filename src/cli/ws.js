import getPort from 'get-port';
import WebSocket, { WebSocketServer } from 'ws';

export async function start({
    port = 1234
} = {}) {
    port = await getPort({ port });

    let wss = new WebSocketServer({ port });

    wss.on('connection', (socket) => {
        console.log("[fragment] client connected.");
        socket.on('message', (message) => {
            send(JSON.parse(message), {
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
