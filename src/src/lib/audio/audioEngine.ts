import * as Tone from 'tone';

/**
 * 音频引擎状态
 */
export type AudioEngineState = {
  initialized: boolean;
  isPlaying: boolean;
  volume: number;
  instrument: string;
};

/**
 * 可用乐器类型
 */
export type InstrumentType = 'piano' | 'synth' | 'marimba' | 'guitar';

// 乐器映射
const instruments: Record<InstrumentType, Tone.Sampler | Tone.PolySynth> = {
  piano: null as unknown as Tone.Sampler,
  synth: null as unknown as Tone.PolySynth,
  marimba: null as unknown as Tone.PolySynth,
  guitar: null as unknown as Tone.PolySynth,
};

// 当前活跃的乐器
let activeInstrument: Tone.Sampler | Tone.PolySynth | null = null;
let initialized = false;

/**
 * 初始化音频引擎
 */
export async function initAudioEngine(): Promise<boolean> {
  if (initialized) return true;

  try {
    // 请求音频上下文
    await Tone.start();
    
    // 创建乐器
    instruments.piano = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3"
      },
      release: 1,
      baseUrl: "/samples/piano/",
    }).toDestination();
    
    instruments.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    
    instruments.marimba = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "sine"
      },
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0,
        release: 1
      }
    }).toDestination();
    
    instruments.guitar = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "fmsquare",
        modulationType: "triangle",
        modulationIndex: 3,
        harmonicity: 3.4
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.2,
        release: 0.4
      }
    }).toDestination();
    
    // 设置默认乐器
    activeInstrument = instruments.piano;
    initialized = true;
    
    return true;
  } catch (error) {
    console.error('Failed to initialize audio engine:', error);
    return false;
  }
}

/**
 * 设置主音量
 */
export function setMasterVolume(volume: number): void {
  Tone.Destination.volume.value = Tone.gainToDb(Math.max(0, Math.min(1, volume)));
}

/**
 * 选择乐器
 */
export function selectInstrument(type: InstrumentType): void {
  if (!initialized) {
    console.warn('Audio engine not initialized');
    return;
  }
  
  if (instruments[type]) {
    activeInstrument = instruments[type];
  } else {
    console.warn(`Instrument ${type} not found, using default`);
    activeInstrument = instruments.piano;
  }
}

/**
 * 播放单个音符
 */
export function playNote(
  note: string,
  duration: number = 0.5,
  time: number = Tone.now(),
  velocity: number = 0.7
): void {
  if (!initialized || !activeInstrument) {
    console.warn('Audio engine not initialized');
    return;
  }
  
  try {
    activeInstrument.triggerAttackRelease(note, duration, time, velocity);
  } catch (error) {
    console.error('Error playing note:', error);
  }
}

/**
 * 播放和弦
 */
export function playChord(
  notes: string[],
  duration: number = 0.5,
  time: number = Tone.now(),
  velocity: number = 0.7
): void {
  if (!initialized || !activeInstrument) {
    console.warn('Audio engine not initialized');
    return;
  }
  
  try {
    activeInstrument.triggerAttackRelease(notes, duration, time, velocity);
  } catch (error) {
    console.error('Error playing chord:', error);
  }
}

/**
 * 播放和弦进行
 */
export function playChordProgression(
  chords: string[][],
  durations: number[] = [],
  startTime: number = Tone.now(),
  velocity: number = 0.7
): void {
  if (!initialized || !activeInstrument) {
    console.warn('Audio engine not initialized');
    return;
  }
  
  let time = startTime;
  
  chords.forEach((chord, index) => {
    const duration = durations[index] || 1;
    playChord(chord, duration, time, velocity);
    time += duration;
  });
}

/**
 * 播放音阶
 */
export function playScale(
  notes: string[],
  duration: number = 0.2,
  direction: 'up' | 'down' | 'both' = 'up',
  velocity: number = 0.7
): void {
  if (!initialized || !activeInstrument) {
    console.warn('Audio engine not initialized');
    return;
  }
  
  let time = Tone.now();
  
  // 上行
  if (direction === 'up' || direction === 'both') {
    notes.forEach(note => {
      playNote(note, duration, time, velocity);
      time += duration;
    });
  }
  
  // 下行
  if (direction === 'down' || direction === 'both') {
    const descendingNotes = direction === 'both' 
      ? notes.slice(0, -1).reverse() // 如果是 both，避免重复最高音
      : [...notes].reverse();
      
    descendingNotes.forEach(note => {
      playNote(note, duration, time, velocity);
      time += duration;
    });
  }
}

/**
 * 停止所有声音
 */
export function stopAllSounds(): void {
  if (!initialized) return;
  
  Object.values(instruments).forEach(instrument => {
    if (instrument) {
      instrument.releaseAll();
    }
  });
}

/**
 * 获取音频引擎状态
 */
export function getAudioEngineState(): AudioEngineState {
  return {
    initialized,
    isPlaying: Tone.Transport.state === 'started',
    volume: Tone.dbToGain(Tone.Destination.volume.value),
    instrument: Object.keys(instruments).find(key => 
      instruments[key as InstrumentType] === activeInstrument
    ) as InstrumentType || 'piano',
  };
} 