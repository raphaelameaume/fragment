const socketProtocol = (location.protocol === 'https:' ? 'wss' : 'ws');
const socketHost = `${location.hostname}:${__FRAGMENT_PORT__}`;

const socket = new WebSocket(`${socketProtocol}://${socketHost}`);


let listeners = {};

function handleMessage(payload) {
    const { event, data } = payload;
    const callbacks = listeners[event];

    if (callbacks && callbacks.length) {
        callbacks.forEach((cb) => cb(data));
    }
}

socket.addEventListener('message', async ({ data }) => {
    handleMessage(JSON.parse(data))
});

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

export const client = { on, off };
