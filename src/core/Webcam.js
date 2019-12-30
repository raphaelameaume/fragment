let noop = () => {};

const Webcam = function() {
    let video = document.createElement('video');
    let canvas = document.createElement('canvas');

    async function request({ video = true, audio = true, onSuccess = noop, onError = noop } = {}) {
        try {
            let stream = await navigator.mediaDevices.getUserMedia({ video, audio });
            handleSuccess(stream);
            onSuccess(stream);
        } catch(error) {
            handleError(error);
            onError(error);
        }
    }

    function handleSuccess(stream) {
        video.srcObject = stream;
        // video.src = window.URL.createObjectURL(stream);
        video.play();
    }

    function handleError(error) {
        console.error('Webcam: error while trying to request access.');
        console.error(error);
    }

    return {
        video,
        canvas,
        request,
    };
}();

export { Webcam };