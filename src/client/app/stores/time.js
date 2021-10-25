import { readable } from "svelte/store";

export const current = readable({ time: 0, deltaTime: 0 }, set => {
    let _raf;
    let lastTime = performance.now();
    let time = Date.now() - __START_TIME__;

    function update() {
        let currentTime = performance.now();
        let deltaTime = currentTime - lastTime;

        lastTime = currentTime;

        time += deltaTime;

        set({ time, deltaTime });

        _raf = requestAnimationFrame(update)
    }

    update();

    return () => {
        cancelAnimationFrame(_raf);
    }
});
