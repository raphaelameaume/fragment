const socketProtocol = (location.protocol === 'https:' ? 'wss' : 'ws');
const socketHost = `${location.hostname}:${__FRAGMENT_PORT__}`;

let socket, listeners = {};

function handleMessage(payload) {
    const { event, data = {} } = payload;
    const callbacks = listeners[event];

    if (callbacks && callbacks.length) {
        callbacks.forEach((cb) => cb(data));
    }
}

function on(event, cb) {
    if (!listeners[event]) {
        listeners[event] = [];
    }

    listeners[event].push(cb);

    return () => {
        off(event, cb);
    };
}

 function off(event, cb) {
    const callbacks = listeners[event];

    if (callbacks && callbacks.length) {
        const filtered = callbacks.filter((callback) => callback !== cb);

        listeners[event] = filtered;
    }
}

let opened = false;
function emit(event, data) {
    if (opened) {
        socket.send(JSON.stringify({
            event,
            data,
        }));
    }
}

if (import.meta.hot) {
    console.log("[fragment] connecting...");

    socket = new WebSocket(`${socketProtocol}://${socketHost}`);

    socket.addEventListener('message', async (message) => {
        const { data } = message;

        handleMessage(JSON.parse(data));
    });

    socket.addEventListener("open", () => {
        console.log("[fragment] connected.");
        opened = true;
    });

    import.meta.hot.on('sketch-update', (data) => {
        console.log(`[fragment] hot updated: ${data.filepath}`);
    })
}

export const client = { on, off, emit };
