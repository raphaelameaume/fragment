/**
 * Run a function maximum once per frame
 * @param {Function} fn 
 * @param {Number} timeout 
 * @returns {Function} debounced function
 */
export default function frameDebounce(fn, timeout = 100){
    let lastTime = performance.now();
    let needCall = false;
    let _raf;
    let a;

    function loop() {
        const now = performance.now();

        if (needCall) {
            needCall = false;
            lastTime = now;
            
            fn.apply(this, a);
            lastTime = now;
        }

        if (now - lastTime > timeout && _raf > -1) {
            cancelAnimationFrame(_raf);
            _raf = null;
        } else {
            _raf = requestAnimationFrame(loop);
        }
    }

    return (...args) => {
        needCall = true;
        a = args;

        if (!_raf) {
            loop();
        }
    };
}
