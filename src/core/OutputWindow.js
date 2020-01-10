const OutputWindow = function() {
    let object;

    function open() {
        object = window.open(`${window.location.href}?output=true`, 'Output', 'width=600,height=500');
    }

    return {
        open,
    }
}();

export { OutputWindow };