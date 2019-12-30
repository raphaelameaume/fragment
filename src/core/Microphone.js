import noop from "../utils/noop";

const Microphone = function() {
    
    async function request({ onSuccess = noop, onError = noop } = {}) {
        try {
            let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            onSuccess(stream);
        } catch(error) {
            console.error('Microphone: error while requesting access.');
            console.error(error);
            onError(error);
        }
    }

    return {
        request,
    };
}();

export { Microphone };