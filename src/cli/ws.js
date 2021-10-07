import WebSocket, { WebSocketServer } from 'ws';

export async function start({
    port = 1234
} = {}) {
    let wss = new WebSocketServer({ port });

    wss.on('connection', (socket) => {
        socket.send(JSON.stringify({ type: 'connected' }))
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

    return {
        port,

        send: (payload) => {
            const stringified = JSON.stringify(payload);

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(stringified);
                }
            });
        },
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
