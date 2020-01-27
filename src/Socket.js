import io from "socket.io-client";

const Socket = function() {
    let socket;
    let listeners = [];

    function init() {
        socket = io('http://192.168.1.44');
        socket.on('message', onMessage);
    }

    function onMessage(data) {
        for (let i = 0; i < listeners.length; i++) {
            if (listeners[i].event === data.event) {
                let { event, ...rest} = data;
                listeners[i].fn(rest);
            }
        }
    }

    function on(event, fn) {
        listeners.push({ event, fn });
    }

    function emit(event, data) {
        if (socket) {
            socket.emit('message', {...data, event });
        }
    }

    // init();

    return {
        on,
        emit,
    }
}();

export { Socket };