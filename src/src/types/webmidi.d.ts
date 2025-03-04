declare namespace WebMidi {
  interface MIDIOptions {
    sysex?: boolean;
    software?: boolean;
  }

  type MIDIInputMap = Map<string, MIDIInput>;
  type MIDIOutputMap = Map<string, MIDIOutput>;

  interface MIDIAccess extends EventTarget {
    inputs: MIDIInputMap;
    outputs: MIDIOutputMap;
    onstatechange: ((event: MIDIConnectionEvent) => void) | null;
    sysexEnabled: boolean;
  }

  interface MIDIPort extends EventTarget {
    id: string;
    manufacturer?: string;
    name?: string;
    type: 'input' | 'output';
    version?: string;
    state: 'connected' | 'disconnected' | 'open' | 'closed';
    connection: 'open' | 'closed' | 'pending';
    onstatechange: ((event: MIDIConnectionEvent) => void) | null;
    open(): Promise<MIDIPort>;
    close(): Promise<MIDIPort>;
  }

  interface MIDIInput extends MIDIPort {
    type: 'input';
    onmidimessage: ((event: MIDIMessageEvent) => void) | null;
    addEventListener(
      type: 'midimessage',
      listener: (event: MIDIMessageEvent) => void,
      options?: AddEventListenerOptions
    ): void;
    removeEventListener(
      type: 'midimessage',
      listener: (event: MIDIMessageEvent) => void,
      options?: EventListenerOptions
    ): void;
  }

  interface MIDIOutput extends MIDIPort {
    type: 'output';
    send(data: number[] | Uint8Array, timestamp?: number): void;
    clear(): void;
  }

  interface MIDIMessageEvent extends Event {
    data: Uint8Array;
    receivedTime: number;
    target: MIDIInput;
  }

  interface MIDIConnectionEvent extends Event {
    port: MIDIPort;
    target: MIDIAccess;
  }
}

interface Navigator {
  requestMIDIAccess(options?: WebMidi.MIDIOptions): Promise<WebMidi.MIDIAccess>;
} 