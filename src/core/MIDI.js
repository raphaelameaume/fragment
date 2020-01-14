import WebMidi from "webmidi";
import { Trigger } from "./Trigger.js";
import { map } from "../math/map.js";

export const MIDI_KNOB = 'Midi-Knob';
export const MIDI_KEY_DOWN = 'Midi-KeyDown';
export const MIDI_KEY_UP = 'Midi-KeyUp';

const Midi = function() {
    let inputs = [];
    let triggersKeyDown = [];
    let triggersKeyUp = [];
    let triggersKnob = [];

    let input;

    function loadDevices(fn) {
        WebMidi.enable((error) => {
            if (error) {
                console.error(error);
            }

            // WebMidi.inputs.forEach( input => console.log(input.name));
            inputs.push(...WebMidi.inputs);

            fn(WebMidi);
        });
    }

    function addConfig(config) {
        configs.push(config);
    }

    function refresh() {
        inputs.length = 0;
        
        inputs.push(...WebMidi.inputs);
    }

    function setInput(value) {
        if (input) {
            console.log('dispose prev input');
        }

        console.log('Midi :: setInput', value);

        input = value;
        input.addListener('noteon', 'all', onNoteOn);
        input.addListener('noteoff', 'all', onNoteOff);
        input.addListener('controlchange', 'all', onControlChange);
    }

    function onNoteOn(e) {
        const { number } = e.note;

        console.log(number, triggersKeyDown);

        for (let i = 0; i < triggersKeyDown.length; i++) {
            let trigger = triggersKeyDown[i];

            if (trigger.value.includes(number) && trigger.enabled) {
                trigger.trigger();
            }
        }
    }

    function onNoteOff(e) {
        const { number } = e.note;
        
        for (let i = 0; i < triggersKeyUp.length; i++) {
            let trigger = triggersKeyUp[i];

            if (trigger.value.includes(number) && trigger.enabled) {
                trigger.trigger();
            }
        }
    }

    function onControlChange(e) {
        let { number } = e.controller;
        let { value } = e;

        let normalized = map(value, 0, 127, 0, 1);

        for (let i = 0; i < triggersKnob.length; i++) {
            let trigger = triggersKnob[i];

            if (trigger.value.includes(number) && trigger.enabled) {
                trigger.trigger({ value: normalized });
            }
        }
    }

    function knob(knobNumber) {
        let trigger = new Trigger(MIDI_KNOB, knobNumber);

        triggersKnob.push(trigger);

        return trigger;
    }

    function keydown(keyNumber) {
        let trigger = new Trigger(MIDI_KEY_DOWN, keyNumber);

        triggersKeyDown.push(trigger);

        return trigger;
    }

    function keyup(keyNumber) {
        let trigger = new Trigger(MIDI_KEY_UP, keyNumber);

        triggersKeyUp.push(trigger);

        return trigger;
    }

    return {
        inputs,
        knob,
        keydown,
        keyup,
        refresh,
        loadDevices,
        setInput,
    };
}();

export { Midi };