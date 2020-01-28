const Time = function() {
    let state = {
        offset: 0,
        deltaTime: 0,
        time: 0,
        set,
    };

    function set({ time, offset, delta }) {
        state.deltaTime = delta;
        state.offset = offset;
    }

    return state;
}();

export { Time };