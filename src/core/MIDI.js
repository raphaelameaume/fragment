import WebMidi from "webmidi";
import { Trigger } from "./Trigger.js";
import { map } from "../math/map.js";

export const MIDI_KNOB = 'Midi-Knob';
export const MIDI_KEY_DOWN = 'Midi-KeyDown';
export const MIDI_KEY_UP = 'Midi-KeyUp';
export const MIDI_NOTE_ON = 'Midi-NoteOn';
export const MIDI_NOTE_OFF = 'Midi-NoteOff';

const Midi = function() {
    let inputs = [];
    let triggersKeyDown = [];
    let triggersKeyUp = [];
    let triggersNoteOn = [];
    let triggersNoteOff = [];
    
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

        for (let i = 0; i < triggersKeyDown.length; i++) {
            let trigger = triggersKeyDown[i];

            if (trigger.value.includes(number) && trigger.enabled) {
                trigger.trigger(e);
            }
        }

        for (let i = 0; i < triggersNoteOn.length; i++) {
            let trigger = triggersNoteOn[i];

            if ((trigger.value.includes(e.note.name) || trigger.value.includes('*')) && trigger.enabled) {
                trigger.trigger(e);
            }
        }
    }

    function onNoteOff(e) {
        const { number } = e.note;
        
        for (let i = 0; i < triggersKeyUp.length; i++) {
            let trigger = triggersKeyUp[i];

            if (trigger.value.includes(number) && trigger.enabled) {
                trigger.trigger(e);
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

        let index = triggersKnob.length;
        triggersKnob.push(trigger);
        trigger.destroy = () => {
            triggersKnob.splice(index, 1);
        };

        return trigger;
    }

    function keydown(keyNumber) {
        let trigger = new Trigger(MIDI_KEY_DOWN, keyNumber);

        addTriggerKeyDown(trigger);

        return trigger;
    }

    function addTriggerKeyDown(trigger) {
        let index = triggersKeyDown.length;
        triggersKeyDown.push(trigger);
        trigger.destroy = () => {
            triggersKeyDown.splice(index, 1);
        };
    }

    function keyup(keyNumber) {
        let trigger = new Trigger(MIDI_KEY_UP, keyNumber);

        addTriggerKeyUp(trigger);

        return trigger;
    }

    function addTriggerKeyUp(trigger) {
        let index = triggersKeyUp.length;
        triggersKeyUp.push(trigger);
        trigger.destroy = () => {
            triggersKeyUp.splice(index, 1);
        };
    }

    function noteon(note) {
        let trigger = new Trigger(MIDI_NOTE_ON, note);

        addTriggerNoteOn(trigger);

        return trigger;
    }

    function addTriggerNoteOn(trigger) {
        let index = triggersNoteOn.length;
        triggersNoteOn.push(trigger);
        trigger.destroy = () => {
            triggersNoteOn.splice(index, 1);
        };
    }

    function noteoff() {
        let trigger = new Trigger(MIDI_NOTE_OFF, note);
        addTriggerNoteOff(trigger);

        return trigger;
    }

    function addTriggerNoteOff() {
        let index = triggersNoteOff.length;
        triggersNoteOff.push(trigger);
        trigger.destroy = () => {
            triggersNoteOff.splice(index, 1);
        };
    }

    function addTrigger(trigger) {
        let triggerTypes = {
            [`${MIDI_KEY_DOWN}`]: addTriggerKeyDown,
            [`${MIDI_KEY_UP}`]: addTriggerKeyUp,
            [`${MIDI_NOTE_ON}`]: addTriggerNoteOn,
            [`${MIDI_NOTE_OFF}`]: addTriggerNoteOff,
        };

        if (triggerTypes[trigger.type]) {
            console.log('Midi->addTrigger :: trigger added.', trigger);
            triggerTypes[trigger.type](trigger);
        } else {
            console.warn('Midi->addTrigger :: type not found.', trigger.type);
        }
    }

    return {
        inputs,
        knob,
        keydown,
        keyup,
        noteon,
        noteoff,
        refresh,
        loadDevices,
        setInput,
        addTrigger,
        KEY_DOWN: MIDI_KEY_DOWN,
        KEY_UP: MIDI_KEY_UP,
        NOTE_ON: MIDI_NOTE_ON,
        NOTE_OFF: MIDI_NOTE_OFF,
        KNOB: MIDI_KNOB,
    };
}();

export { Midi };