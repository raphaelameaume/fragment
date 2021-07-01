import { WebGLRenderer } from "three";

let renderer;

export let init = () => {
    renderer = new WebGLRenderer({ antialias: true });

    renderer.domElement.style.cssText = `
        width: ${renderer.domElement.width}px;
    `;
    // renderer.setPixelRatio(window.devicePixelRatio);


    document.body.appendChild(renderer.domElement);


    // const $record = document.querySelector('#record');
    // const $stop = document.querySelector('#stop');

    // let _stream;
    // let _mediaRecorder;

    // let chunks = [];

    // $record.addEventListener("click", () => {
    //     if (!_mediaRecorder) {
    //         _stream = renderer.domElement.captureStream(60);
    //         _mediaRecorder = new MediaRecorder(_stream, {
    //             mimeType: "video/webm",
    //         });
    //         _mediaRecorder.ondataavailable = (e) => {
    //             chunks.push(e.data);
    //         };

    //         _mediaRecorder.onstop = () => {
    //             console.log("onstop", chunks);

    //             let blob = new Blob(chunks, { 'type' : 'video/webm' });
    //             let url = window.URL.createObjectURL(blob);

    //             $link.href = url;
    //             $link.download = 'canvas.webm';
    //             $link.click();

    //             chunks = [];
    //         };
    //     }



    //     _mediaRecorder.start();

    //     console.log(_mediaRecorder.state);
    // });

    // let $link = document.createElement('a');

    // $stop.addEventListener("click", () => {
    //     _mediaRecorder.stop();
    // });



    return renderer;
};

export let resize = () => {

};

export let render = ({ mode, stages }) => {

}

export let update = ({ stages }) => {
    for (let i = 0; i < stages.length; i++) {
        stages[i].update();
    }
};
