let noop = () => {};

const Webcam = function() {
    let video = document.createElement('video');
    let canvas = document.createElement('canvas');
    let stream, context;

    async function request({ video = true, audio = true, onSuccess = noop, onError = noop } = {}) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video, audio });

            handleSuccess(stream);
            onSuccess(stream);
        } catch(error) {
            handleError(error);
            onError(error);
        }
    }

    function stop() {
        if (stream) {
            let tracks = stream.getTracks();

            for (let i = 0; i < tracks.length; i++) {
                let track = tracks[i];
                track.stop();
            }
        }
    }

    function handleSuccess(stream) {
        video.addEventListener('canplay', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
    
            context = canvas.getContext('2d');
            draw();
        })
        video.srcObject = stream;
        video.play();
    }
    
    function draw() {
        requestAnimationFrame(draw);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    function handleError(error) {
        console.error('Webcam: error while trying to request access.');
        console.error(error);
    }

    return {
        video,
        canvas,
        request,
        stop,
    };
}();

export { Webcam };