import { on } from "../events";

let BEAT_HOLD_TIME = 300;
let BEAT_DECAY_RATE = 0.992;
let BEAT_MIN = 0.1;

function FrequencyRange(index, start, end) {
    let volume = 0;
    let beatCutOff = 0;
    let beatTime = 0;
    let lastBeat = 0;

    function update(freqByteData, deltaTime) {
        volume = 0;

        for (let i = start; i < end; i++) {
            volume += freqByteData[i];
        }

        volume /= (end - start) * 256;

        // detect beat
        if (beatTime >= BEAT_HOLD_TIME && volume > beatCutOff && volume > BEAT_MIN) {
            //emit('beat');
            beatCutOff = volume * 1.15;
            lastBeat = beatCutOff;
            beatTime = 0;
        } else {
            if (beatTime <= BEAT_HOLD_TIME) {
                beatTime += deltaTime * 1000;
            }
            else {
                beatCutOff *= BEAT_DECAY_RATE;
                beatCutOff = Math.max(beatCutOff, BEAT_MIN);
            }
        }
    }

    return {
        update,
        volume: () => volume
    };
}

const Audio = function() {
    let context = new AudioContext();
    let masterGain = context.createGain();
    let analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;
    masterGain.connect(analyser);

    let { frequencyBinCount } = analyser;
    let freqByteData = new Uint8Array(frequencyBinCount);

    let ranges = [];
    let rangeCount = 8;
    let audioSource = null;

    let volume = 0;
    let globalVolume = 1;
    let muted = false;
    let live = false;

    let audio = null;

    function init() {
        createRangesAnalysers();

        if (!live && !muted) {
            masterGain.connect(context.destination);
        }

        on('frame', update);
    }

    function createRangesAnalysers() {
        let step = Math.floor(frequencyBinCount / rangeCount);
        
        let globalRange = createRangeAnalyser(0, frequencyBinCount); // global
        
        let s = 0;
        for (let i = 0; i < rangeCount; i++) {
            createRangeAnalyser(s, s + step);
            s += step;
        }
    }

    function createRangeAnalyser(start, end) {
        let range = FrequencyRange(ranges.length, start, end);
        ranges.push(range);
        
        return range;
    }

    function attachStream(stream) {
        masterGain.disconnect(context.destination);

        audioSource = context.createMediaStreamSource(stream);
        audioSource.connect(masterGain);
    }

    function detachStream() {
        disconnectSource();
        masterGain.connect(context.destination);
    }

    function update({ deltaTime }) {
        analyser.getByteFrequencyData(freqByteData);

        for (let i = 0; i < ranges.length; i++) {
            ranges[i].update(freqByteData, deltaTime);
        }

        volume = ranges[0].volume() * globalVolume;
    }

    // value need to be between 0 and 1
    function setGlobalVolume(value) {
        globalVolume = value * 4;
    }

    // value need to be between 0 and 1
    function setHold(value) {
        BEAT_HOLD_TIME = value * 1000;
    }

    // value need to be between 0 and 1
    function setDecay(value) {
        BEAT_DECAY_RATE = 0.95 + value * 0.0499;
    }

    // value need to be between 0 and 1
    function setMin(value) {
        BEAT_MIN = value;
    }

    function play(source, { onEnd = () => {} } = {}) {
        audio = document.createElement('audio');
        audio.loop = false;

        audio.addEventListener('loadedmetadata', () => {
            console.log('loaded metadata');
        });
        audio.addEventListener('ended', () => {
            onEnd();
        });

        audio.src = source;

        

        audioSource = context.createMediaElementSource(audio);
        audioSource.connect(masterGain);

        audio.play();
    }

    function pause() {
        audio.pause();
    }

    function getRange(index = 0) {
        return ranges[index];
    }

    function disconnectSource() {
        if (audioSource) {
            audioSource.disconnect(masterGain);
            audioSource = null;
        }
    }

    init();

    return {
        masterGain,
        attachStream,
        detachStream,
        setDecay,   
        setGlobalVolume,
        setHold,
        setMin,
        play,
        pause,
        getRange,
        disconnectSource,
        volume: () => volume,
    };
}();

export { Audio };