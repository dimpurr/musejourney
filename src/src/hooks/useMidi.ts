import { useState, useEffect, useCallback } from 'react';
import { MidiNote } from '@/types/music';
import {
  MidiAccessState,
  requestMIDIAccess,
  listenToMIDIInput,
  sendMIDINote,
} from '@/lib/midi/midiAccess';

interface UseMidiOptions {
  onNoteOn?: (note: MidiNote) => void;
  onNoteOff?: (note: MidiNote) => void;
}

export function useMidi(options: UseMidiOptions = {}) {
  const [midiState, setMidiState] = useState<MidiAccessState>({
    supported: false,
    access: null,
    inputs: [],
    outputs: [],
    activeInput: null,
    activeOutput: null,
    error: null,
  });

  const [activeNotes, setActiveNotes] = useState<Record<string, MidiNote>>({});

  // 初始化 MIDI 访问
  useEffect(() => {
    const initMidi = async () => {
      const state = await requestMIDIAccess();
      setMidiState(state);
    };

    initMidi();
  }, []);

  // 处理 MIDI 设备状态变化
  useEffect(() => {
    if (!midiState.access) return;

    const handleStateChange = (event: Event) => {
      // 类型断言
      const midiEvent = event as WebMidi.MIDIConnectionEvent;
      console.log('MIDI connection state change:', midiEvent.port.name, midiEvent.port.state);
      
      // 确保 midiState.access 不为 null
      if (!midiState.access) return;
      
      // 重新获取 MIDI 设备列表
      const inputs = Array.from(midiState.access.inputs.values());
      const outputs = Array.from(midiState.access.outputs.values());
      
      setMidiState(prev => ({
        ...prev,
        inputs,
        outputs,
        // 如果当前活跃设备断开连接，则选择新的设备或设为 null
        activeInput: prev.activeInput && inputs.includes(prev.activeInput) 
          ? prev.activeInput 
          : inputs.length > 0 ? inputs[0] : null,
        activeOutput: prev.activeOutput && outputs.includes(prev.activeOutput)
          ? prev.activeOutput
          : outputs.length > 0 ? outputs[0] : null,
      }));
    };

    // 使用 EventListener 类型
    midiState.access.addEventListener('statechange', handleStateChange as EventListener);
    
    return () => {
      if (midiState.access) {
        midiState.access.removeEventListener('statechange', handleStateChange as EventListener);
      }
    };
  }, [midiState.access]);

  // 监听 MIDI 输入
  useEffect(() => {
    if (!midiState.activeInput) return;

    const handleNoteOn = (note: MidiNote) => {
      setActiveNotes(prev => ({
        ...prev,
        [note.midi]: note,
      }));
      
      if (options.onNoteOn) {
        options.onNoteOn(note);
      }
    };

    const handleNoteOff = (note: MidiNote) => {
      setActiveNotes(prev => {
        const newState = { ...prev };
        delete newState[note.midi];
        return newState;
      });
      
      if (options.onNoteOff) {
        options.onNoteOff(note);
      }
    };

    const cleanup = listenToMIDIInput(
      midiState.activeInput,
      handleNoteOn,
      handleNoteOff
    );
    
    return cleanup;
  }, [midiState.activeInput, options.onNoteOn, options.onNoteOff]);

  // 选择 MIDI 输入设备
  const selectInput = useCallback((inputId: string | null) => {
    setMidiState(prev => {
      if (!inputId) {
        return { ...prev, activeInput: null };
      }
      
      const input = prev.inputs.find(input => input.id === inputId);
      return { ...prev, activeInput: input || null };
    });
  }, []);

  // 选择 MIDI 输出设备
  const selectOutput = useCallback((outputId: string | null) => {
    setMidiState(prev => {
      if (!outputId) {
        return { ...prev, activeOutput: null };
      }
      
      const output = prev.outputs.find(output => output.id === outputId);
      return { ...prev, activeOutput: output || null };
    });
  }, []);

  // 发送 MIDI 音符
  const playNote = useCallback(
    (note: string | number, velocity = 0.7, duration = 500) => {
      if (midiState.activeOutput) {
        sendMIDINote(midiState.activeOutput, note, velocity, 0, duration);
      }
    },
    [midiState.activeOutput]
  );

  // 播放和弦
  const playChord = useCallback(
    (notes: Array<string | number>, velocity = 0.7, duration = 500) => {
      notes.forEach(note => {
        playNote(note, velocity, duration);
      });
    },
    [playNote]
  );

  return {
    midiState,
    activeNotes,
    selectInput,
    selectOutput,
    playNote,
    playChord,
  };
} 