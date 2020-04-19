const Uniforms = function() {
    let uniforms = {
        uTime: { value: 0 },
        roomDiffuse: { value: new THREE.Color(0xFF0000) }
    }

    function common() {
        return uniforms;
    }

    function get(name) {
        return uniforms[name];
    }

    function update({ time, deltaTime }) {
        uniforms.uTime.value = time / 1000;
    }

    return {
        common,
        update,
        get,
    };
}();

export default Uniforms;