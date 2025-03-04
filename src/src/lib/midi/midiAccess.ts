import { MidiNote } from '@/types/music';

/**
 * MIDI 访问状态
 */
export type MidiAccessState = {
  supported: boolean;
  access: WebMidi.MIDIAccess | null;
  inputs: WebMidi.MIDIInput[];
  outputs: WebMidi.MIDIOutput[];
  activeInput: WebMidi.MIDIInput | null;
  activeOutput: WebMidi.MIDIOutput | null;
  error: Error | null;
};

/**
 * MIDI 消息处理器
 */
export type MidiMessageHandler = (message: WebMidi.MIDIMessageEvent) => void;

/**
 * MIDI 音符事件处理器
 */
export type MidiNoteHandler = (note: MidiNote) => void;

/**
 * 请求 MIDI 访问权限
 */
export async function requestMIDIAccess(): Promise<MidiAccessState> {
  // 检查浏览器是否支持 Web MIDI API
  if (!navigator.requestMIDIAccess) {
    return {
      supported: false,
      access: null,
      inputs: [],
      outputs: [],
      activeInput: null,
      activeOutput: null,
      error: new Error('Web MIDI API is not supported in this browser'),
    };
  }

  try {
    // 请求 MIDI 访问权限
    const access = await navigator.requestMIDIAccess({ sysex: false });
    
    // 获取所有 MIDI 输入和输出设备
    const inputs = Array.from(access.inputs.values());
    const outputs = Array.from(access.outputs.values());
    
    return {
      supported: true,
      access,
      inputs,
      outputs,
      activeInput: inputs.length > 0 ? inputs[0] : null,
      activeOutput: outputs.length > 0 ? outputs[0] : null,
      error: null,
    };
  } catch (error) {
    return {
      supported: true,
      access: null,
      inputs: [],
      outputs: [],
      activeInput: null,
      activeOutput: null,
      error: error instanceof Error ? error : new Error('Unknown error accessing MIDI'),
    };
  }
}

/**
 * 将 MIDI 音符编号转换为音符名称
 */
export function midiNoteToName(midiNote: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  const noteName = noteNames[midiNote % 12];
  return `${noteName}${octave}`;
}

/**
 * 将音符名称转换为 MIDI 音符编号
 */
export function noteNameToMidi(noteName: string): number {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const regex = /^([A-G][#b]?)(-?\d+)$/;
  const match = noteName.match(regex);
  
  if (!match) {
    throw new Error(`Invalid note name: ${noteName}`);
  }
  
  let [, note, octave] = match;
  let noteIndex = noteNames.indexOf(note);
  
  if (noteIndex === -1 && note.endsWith('b')) {
    // 处理降号：将降号转换为相应的升号
    const flatToSharp: Record<string, string> = {
      'Cb': 'B', 'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    note = flatToSharp[note];
    noteIndex = noteNames.indexOf(note);
    if (note === 'B') {
      octave = String(parseInt(octave) - 1);
    }
  }
  
  if (noteIndex === -1) {
    throw new Error(`Invalid note name: ${noteName}`);
  }
  
  return noteIndex + (parseInt(octave) + 1) * 12;
}

/**
 * 解析 MIDI 消息
 */
export function parseMIDIMessage(message: WebMidi.MIDIMessageEvent): MidiNote | null {
  const data = message.data;
  const command = data[0] >> 4;
  const channel = data[0] & 0xf;
  const midiNote = data[1];
  const velocity = data[2] / 127; // 将 MIDI 力度 (0-127) 转换为 0-1 范围
  
  // 音符开始事件
  if (command === 9 && velocity > 0) {
    return {
      note: midiNoteToName(midiNote),
      midi: midiNote,
      velocity,
    };
  }
  
  // 音符结束事件 (音符关闭命令或音符开启命令但力度为 0)
  if (command === 8 || (command === 9 && velocity === 0)) {
    return {
      note: midiNoteToName(midiNote),
      midi: midiNote,
      velocity: 0,
    };
  }
  
  return null;
}

/**
 * 监听 MIDI 输入
 */
export function listenToMIDIInput(
  input: WebMidi.MIDIInput | null,
  onNoteOn: MidiNoteHandler,
  onNoteOff: MidiNoteHandler
): () => void {
  if (!input) {
    return () => {};
  }
  
  const handleMIDIMessage = (event: WebMidi.MIDIMessageEvent) => {
    const midiNote = parseMIDIMessage(event);
    if (midiNote) {
      if (midiNote.velocity > 0) {
        onNoteOn(midiNote);
      } else {
        onNoteOff(midiNote);
      }
    }
  };
  
  input.addEventListener('midimessage', handleMIDIMessage);
  
  // 返回清理函数
  return () => {
    input.removeEventListener('midimessage', handleMIDIMessage);
  };
}

/**
 * 发送 MIDI 音符事件
 */
export function sendMIDINote(
  output: WebMidi.MIDIOutput | null,
  note: number | string,
  velocity: number = 0.7,
  channel: number = 0,
  duration: number = 500
): void {
  if (!output) {
    return;
  }
  
  const midiNote = typeof note === 'string' ? noteNameToMidi(note) : note;
  const midiVelocity = Math.floor(velocity * 127);
  
  // 发送音符开始事件
  output.send([0x90 | channel, midiNote, midiVelocity]);
  
  // 设置定时器发送音符结束事件
  setTimeout(() => {
    output.send([0x80 | channel, midiNote, 0]);
  }, duration);
}