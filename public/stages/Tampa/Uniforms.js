const Uniforms = function() {
    let uniforms = {
        uTime: { value: 0 }
    }

    function common() {
        return uniforms;
    }

    function update({ time, deltaTime }) {
        uniforms.uTime.value = time / 1000;
    }

    return {
        common,
        update,
    };
}();

export default Uniforms;