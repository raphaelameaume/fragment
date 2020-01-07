function Emitter(all = {}) {
    let log = true;

    function on(type, handler) {
        (all[type] || (all[type] = [])).push(handler);
    }

    function off(type, handler) {
        if (all[type]) {
            all[type].splice(all[type].indexOf(handler) >>> 0, 1);
        }
    }

    function emit(type, data = {}) {
        // log && console.group(`emit ${type}`);
        // log && console.log('data :: ', data);
        // log && console.groupEnd();

        (all[type] || []).slice().map((handler) => { handler(data); });
        (all['*'] || []).slice().map((handler) => { handler(type, data); });
    }

    function emitAsync(event, data = {}) {
        return new Promise((resolve, reject) => {
            emit(event, { ...data, resolve, reject });
        });
    }

    return {
        on,
        off,
        emit,
        emitAsync,
    };
};

const { on, off, emit, emitAsync } = Emitter();

export { on, off, emit, emitAsync, Emitter };