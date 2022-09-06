export declare global {
  namespace WebMidi {
    /**
     * All the posible notes.
     */
    type MIDINote =
      | "C"
      | "C#"
      | "D"
      | "D#"
      | "E"
      | "F"
      | "F#"
      | "G"
      | "G#"
      | "A"
      | "A#"
      | "B";

    interface MIDIPort extends EventTarget {
      /**
       * A unique ID of the port. This can be used by developers to remember ports the
       * user has chosen for their application.
       */
      id: string;

      /**
       * The manufacturer of the port.
       */
      manufacturer?: string | undefined;

      /**
       * The system name of the port.
       */
      name?: string | undefined;

      /**
       * A descriptor property to distinguish whether the port is an input or an output
       * port.
       */
      type: MIDIPortType;

      /**
       * The version of the port.
       */
      version?: string | undefined;

      /**
       * The state of the device.
       */
      state: MIDIPortDeviceState;

      /**
       * The state of the connection to the device.
       */
      connection: MIDIPortConnectionState;

      /**
       * The handler called when an existing port changes its state or connection
       * attributes.
       */
      onstatechange(e: MIDIConnectionEvent): void;

      addEventListener(
        type: "statechange",
        listener: (this: this, e: MIDIConnectionEvent) => any,
        options?: boolean | AddEventListenerOptions
      ): void;
      addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
      ): void;

      /**
       * Makes the MIDI device corresponding to the MIDIPort explicitly available. Note
       * that this call is NOT required in order to use the MIDIPort - calling send() on
       * a MIDIOutput or attaching a MIDIMessageEvent handler on a MIDIInputPort will
       * cause an implicit open().
       *
       * When invoked, this method returns a Promise object representing a request for
       * access to the given MIDI port on the user's system.
       */
      open(): Promise<MIDIPort>;

      /**
       * Makes the MIDI device corresponding to the MIDIPort
       * explicitly unavailable (subsequently changing the state from "open" to
       * "connected"). Note that successful invocation of this method will result in MIDI
       * messages no longer being delivered to MIDIMessageEvent handlers on a
       * MIDIInputPort (although setting a new handler will cause an implicit open()).
       *
       * When invoked, this method returns a Promise object representing a request for
       * access to the given MIDI port on the user's system. When the port has been
       * closed (and therefore, in exclusive access systems, the port is available to
       * other applications), the vended Promise is resolved. If the port is
       * disconnected, the Promise is rejected.
       */
      close(): Promise<MIDIPort>;
    }

    interface MIDIInput extends MIDIPort {
      type: "input";
      onmidimessage(e: MIDIMessageEvent): void;

      addEventListener(
        type: "midimessage",
        listener: (this: this, e: MIDIMessageEvent) => any,
        options?: boolean | AddEventListenerOptions
      ): void;
      addEventListener(
        type: "statechange",
        listener: (this: this, e: MIDIConnectionEvent) => any,
        options?: boolean | AddEventListenerOptions
      ): void;
      addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
      ): void;
    }

    type MIDIMessageEvent = {
      /**
       * The type of the message event.
       */
      type: "noteon" | "noteoff" | "controlchange";

      /**
       * The triggered note.
       */
      note: { number: number; name: MIDINote };

      /**
       * The channel the message was sent to.
       */
      channel: number;

      /**
       * The normalized velocity of the note expressed as a float between 0 and 1.
       */
      velocity: number;

      /**
       * The raw velocity of the note expressed as an integer between 0 and 127.
       */
      rawVelocity: number;

      /**
       * The normalized value expressed as a float between 0 and 1.
       */
      value: number;

      /**
       * The raw value expressed as an integer between 0 and 127.
       */
      rawValue: number;

      /**
       * The object that dispatched the event.
       */
      currentTarget: MIDIInput;

      /**
       * The object that dispatched the event.
       */
      target: MIDIInput;

      /**
       * The object that dispatched the event.
       */
      srcElement: MIDIInput;
    };
  }
}
