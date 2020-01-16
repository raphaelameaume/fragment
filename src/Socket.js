import io from "socket.io-client";

const Socket = function() {
    let socket = io('http://192.168.1.44');

    let listeners = [];

    socket.on('message', onMessage);

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
        socket.emit('message', {...data, event });
    }

    return {
        on,
        emit,
    }
}();

export { Socket };