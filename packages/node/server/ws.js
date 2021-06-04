import WebSocket from "ws";
import getPort from "get-port";

export async function createWebSocketServer() {
    let port = await getPort({ port: 1234 });
    let deffered = [];

    let wss = new WebSocket.Server({ port });
    wss.on('connection', function (socket) {
        socket.send(JSON.stringify({ type: "connection"}));

        if (deferred.length > 0) {
            deferred.forEach(e => {
                socket.send(JSON.stringify(e));
            });
            deferred.length = 0;
        }
    });

    function send(payload) {
        if (payload.type === 'error' && !wss.clients.size) {
            deffered.push(payload);
            return;
        }

        const stringified = JSON.stringify(payload)
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(stringified)
            }
        })
    }

    function close() {
        return new Promise((resolve, reject) => {
            wss.close((err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        });
    }

    return {
        port,
        send,
        close
    };
}
