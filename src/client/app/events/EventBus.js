function EventBus() {
    let all = {};

    function on(event, fn) {
        (all[event] || (all[event] = [])).push(fn);

        return () => {
            off(event, fn);
        };
    }

    function off(event, fn) {
        if (all[event]) {
            all[event].splice(all[event].indexOf(fn) >>> 0, 1);
        }
    }

    function emit(event, data = {}) {
        let listeners = all[event] || [];

        if (eventBus.log) {
            console.groupCollapsed(`%cEventBus %c${event} %c(${listeners.length})`, 'font-weight: normal', 'font-weight: bold', 'font-weight: normal');
            console.log('data', data);
            console.log('listeners', listeners);
            console.groupEnd();
        }

        (all[event] || []).slice().map((fn) => { fn(data); });
        (all['*'] || []).slice().map((fn) => { fn(data, event); });
    }

    const eventBus = {
        on,
        off,
        emit,
        log: false,
    };

    return eventBus;
};

export default EventBus;
