import WebMidi from "webmidi";

const Midi = function() {
    let inputs = [];

    function init() {
        WebMidi.enable((error) => {
            if (error) {
                console.error(error);
            }

            // WebMidi.inputs.forEach( input => console.log(input.name));
            inputs.push(...WebMidi.inputs);
        });
    }

    function refresh() {
        inputs = [...WebMidi.inputs];
    }

    function knob() {

    }

    function pad() {

    }

    init();

    return {
        inputs,
        knob,
        pad,
        refresh,
    };
}();

export { Midi };