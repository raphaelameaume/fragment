import noop from "../utils/noop";

const Microphone = function() {
    let stream;
    
    async function request({ onSuccess = noop, onError = noop } = {}) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            onSuccess(stream);
        } catch(error) {
            console.error('Microphone: error while requesting access.');
            console.error(error);
            onError(error);
        }
    }

    function stop() {
        if (stream) {
            let tracks = stream.getTracks();

            for (let i = 0; i < tracks.length; i++) {
                let track = tracks[i];
                track.stop();
            }
        }
    }

    return {
        request,
        stop,
    };
}();

export { Microphone };