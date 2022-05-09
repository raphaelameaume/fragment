import { readable } from "svelte/store";

export const current = readable({ time: 0, deltaTime: 0 }, set => {
    let _raf;
    let lastTime = performance.now();
    let startTime = Date.now() - __START_TIME__;
    let time = startTime;

    function update() {
        let currentTime = performance.now();
        let deltaTime = currentTime - lastTime;

        lastTime = currentTime;

        time += deltaTime;

        set({ time, deltaTime, startTime });

        _raf = requestAnimationFrame(update)
    }

    update();

    return () => {
        cancelAnimationFrame(_raf);
    }
});
