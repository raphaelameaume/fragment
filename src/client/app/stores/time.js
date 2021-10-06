import { readable } from "svelte/store";

export const current = readable({ time: 0, deltaTime: 0 }, set => {
    let _raf;
    let lastTime = performance.now();

    function update() {
        let currentTime = performance.now();
        let deltaTime = currentTime - lastTime;

        lastTime = currentTime;

        set({ time: currentTime, deltaTime });

        _raf = requestAnimationFrame(update)
    }

    update();

    return () => {
        cancelAnimationFrame(_raf);
    }
});
