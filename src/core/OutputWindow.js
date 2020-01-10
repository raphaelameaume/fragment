const OutputWindow = function() {
    let object;

    let dimensions = {
        width: window.innerWidth,
        height: window.innerHeight,
    }
    let resizeFn;

    async function open() {
        object = window.open(`${window.location.href}?output=true`, 'Output', `width=${dimensions.width},height=${dimensions.height}`);

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

    return {
        open,
        dimensions,
        onResize,
    }
}();

export { OutputWindow };