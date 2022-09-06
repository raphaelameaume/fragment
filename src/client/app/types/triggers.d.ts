declare module "@fragment/triggers" {
  // Mouse
  function onClick(listener: (event: MouseEvent) => void): void;
  function onMouseDown(listener: (event: MouseEvent) => void): void;
  function onMouseUp(listener: (event: MouseEvent) => void): void;
  function onMouseMove(listener: (event: MouseEvent) => void): void;

  // Keyboard
  function onKeyPress(
    key?: string | string[],
    listener: (event: KeyboardEvent) => void
  ): void;
  function onKeyDown(
    key?: string | string[],
    listener: (event: KeyboardEvent) => void
  ): void;
  function onKeyUp(
    key?: string | string[],
    listener: (event: KeyboardEvent) => void
  ): void;

  // MIDI
  function onNoteOn(
    note?: WebMidi.MIDINote | WebMidi.MIDINote[],
    listener: (event: WebMidi.MIDIMessageEvent) => void
  ): void;
  function onNoteOff(
    note?: WebMidi.MIDINote | WebMidi.MIDINote[],
    listener: (event: WebMidi.MIDIMessageEvent) => void
  ): void;

  function onNumberOn(
    noteNumber?: number | number[],
    listener: (event: WebMidi.MIDIMessageEvent) => void
  ): void;
  function onNumberOff(
    noteNumber?: number | number[],
    listener: (event: WebMidi.MIDIMessageEvent) => void
  ): void;

  function onControlChange(
    control?: number | number[],
    listener: (event: WebMidi.MIDIMessageEvent) => void
  ): void;
}
