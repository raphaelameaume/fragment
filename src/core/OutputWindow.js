const OutputWindow = function() {
    let object;
    let opened = false;

    let dimensions = {
        width: window.innerWidth,
        height: window.innerHeight,
    }
    let resizeFn;

    async function open(renderer) {
        object = window.open(`${window.location.href}?mode=output`, 'Output', `width=${dimensions.width},height=${dimensions.height}`);

        // object.renderer = renderer;
        // object.renderer.fromSource = true;

        // object.treshold = renderer.treshold;

        opened = true;

        object.addEventListener('load', () => {
            console.log('output loaded');
        });

        object.addEventListener('resize', () => {
            dimensions.width = object.innerWidth;
            dimensions.height = object.innerHeight;

            if (resizeFn) {
                resizeFn({ width: dimensions.width, height: dimensions.height });
            }
        });
    }

    function onResize(fn) {
        resizeFn = fn;
    }

    function setSize(width, height) {
        dimensions.width = width;
        dimensions.height = height;

        if (opened) {
            object.resizeTo(width, height);
        }

        if (resizeFn) {
            resizeFn({ width: dimensions.width, height: dimensions.height });
        }
    }

    return {
        open,
        dimensions,
        onResize,
        setSize,
    }
}();

export { OutputWindow };