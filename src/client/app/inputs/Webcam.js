import Input from "./Input";

class Webcam extends Input {

    constructor() {
        super();

        this._useCanvas = false;
        this.stream = null;
        this.requested = false;

        this.video = document.createElement('video');
        this.canvas = document.createElement('canvas');
        this.context = null;
    }
    
    /**
    @param {Boolean} value
     */
    set useCanvas(value) {
        const prev = this.useCanvas;

        this._useCanvas = value;

        if (!prev && this._useCanvas) {
            this.prepareCanvas();
        } else if (prev && this._useCanvas) {
            cancelAnimationFrame(this._raf);
            this._raf = null;
        }
    }

    get useCanvas() {
        return this._useCanvas;
    }

    enable() {
        if (!this.requested) {
            this.request();
        }
    }

    disable() {
        this.enabled = false;

        if (this.stream) {
            if (this.useCanvas && this._raf) {
                cancelAnimationFrame(this._raf);
                this._raf = null;
            }

            this.stream.getTracks().forEach(track => {
                track.stop()
            });

            this.stream = null;
        }
    }

    prepareCanvas() {
        this.canvas.width = video.videoWidth;
        this.canvas.height = video.videoHeight;

        this.context = this.canvas.getContext("2d");
    }

    drawToCanvas() {
        this.context.drawImage(video, 0, 0, canvas.width, canvas.height);

        this._raf = requestAnimationFrame(() => {
            this.drawToCanvas()
        });
    }

    async request() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            this.requested = true;
            this.enabled = true;

            this.video.addEventListener('canplay', () => {
                this.prepareCanvas();

                if (this.useCanvas) {
                    this.drawToCanvas();
                }
            });
            this.video.srcObject = this.stream;
            this.video.play();
        } catch(error) {
            console.error(`Error while trying to access webcam.`);
            console.log(error);
        }
    }

}

export default new Webcam();
