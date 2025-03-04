'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { playNote } from '@/lib/audio/audioEngine';
import { useMidi } from '@/hooks/useMidi';

// 定义钢琴键盘组件的属性
interface PianoKeyboardProps {
  startNote?: number; // 起始 MIDI 音符编号，默认为 48 (C3)
  endNote?: number; // 结束 MIDI 音符编号，默认为 72 (C5)
  showNoteNames?: boolean; // 是否显示音符名称
  highlightedNotes?: number[]; // 高亮显示的音符
  onNoteOn?: (note: number) => void; // 音符按下回调
  onNoteOff?: (note: number) => void; // 音符释放回调，暂未使用
}

// 音符名称映射
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 判断是否为黑键
const isBlackKey = (note: number): boolean => {
  const noteName = note % 12;
  return [1, 3, 6, 8, 10].includes(noteName);
};

// 获取音符名称
const getNoteName = (note: number): string => {
  const noteName = NOTE_NAMES[note % 12];
  const octave = Math.floor(note / 12) - 1;
  return `${noteName}${octave}`;
};

export default function PianoKeyboard({
  startNote = 48, // C3
  endNote = 72, // C5
  showNoteNames = true,
  highlightedNotes = [],
  onNoteOn
}: PianoKeyboardProps) {
  // 活跃的音符状态
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  
  // 鼠标状态
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [lastTouchedNote, setLastTouchedNote] = useState<number | null>(null);
  
  // 使用 MIDI 钩子
  const { midiState, activeNotes: midiActiveNotes } = useMidi();
  
  // 计算所有音符
  const allNotes = useMemo(() => {
    const notes: number[] = [];
    for (let i = startNote; i <= endNote; i++) {
      notes.push(i);
    }
    return notes;
  }, [startNote, endNote]);
  
  // 计算白键和黑键
  const whiteKeys = useMemo(() => allNotes.filter(note => !isBlackKey(note)), [allNotes]);
  const blackKeys = useMemo(() => allNotes.filter(note => isBlackKey(note)), [allNotes]);
  
  // 处理音符按下
  const handleNoteOn = useCallback((note: number) => {
    if (note >= startNote && note <= endNote) {
      setActiveNotes(prev => {
        const newSet = new Set(prev);
        newSet.add(note);
        return newSet;
      });
      
      // 播放音符
      playNote(getNoteName(note));
      
      // 调用回调
      if (onNoteOn) {
        onNoteOn(note);
      }
    }
  }, [startNote, endNote, onNoteOn]);
  
  // 处理鼠标按下
  const handleMouseDown = (note: number) => {
    setIsMouseDown(true);
    setLastTouchedNote(note);
    handleNoteOn(note);
  };
  
  // 处理鼠标移动
  const handleMouseEnter = (note: number) => {
    if (isMouseDown && lastTouchedNote !== note) {
      setLastTouchedNote(note);
      handleNoteOn(note);
    }
  };
  
  // 处理鼠标释放
  const handleMouseUp = () => {
    setIsMouseDown(false);
    setLastTouchedNote(null);
    // 释放所有通过鼠标激活的音符
    setActiveNotes(new Set());
  };
  
  // 监听 MIDI 音符变化
  useEffect(() => {
    // 将 MIDI 音符添加到活跃音符中
    const newActiveNotes = new Set(activeNotes);
    
    for (const [noteStr, midiNote] of Object.entries(midiActiveNotes)) {
      const midiNoteNumber = parseInt(noteStr, 10);
      
      if (midiNote.velocity > 0) {
        if (midiNoteNumber >= startNote && midiNoteNumber <= endNote) {
          newActiveNotes.add(midiNoteNumber);
        }
      } else {
        newActiveNotes.delete(midiNoteNumber);
      }
    }
    
    setActiveNotes(newActiveNotes);
  }, [midiActiveNotes, startNote, endNote]);
  
  // 监听鼠标释放事件
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMouseDown) {
        handleMouseUp();
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isMouseDown]);
  
  // 计算键盘宽度
  const keyboardWidth = whiteKeys.length * 40; // 每个白键宽度为 40px
  
  return (
    <div className="piano-container my-4">
      {/* MIDI 设备信息 */}
      {midiState.inputs.length > 0 && (
        <div className="text-sm text-gray-600 mb-2">
          已连接 MIDI 设备: {midiState.inputs.map(input => input.name).join(', ')}
        </div>
      )}
      
      {/* 钢琴键盘 */}
      <div 
        className="piano-keyboard relative"
        style={{ 
          width: `${keyboardWidth}px`, 
          height: '150px',
          position: 'relative',
          userSelect: 'none'
        }}
      >
        {/* 白键 */}
        <div className="white-keys flex">
          {whiteKeys.map(note => {
            const isActive = activeNotes.has(note);
            const isHighlighted = highlightedNotes.includes(note);
            
            return (
              <div
                key={note}
                className={`white-key border border-gray-300 rounded-b ${
                  isActive ? 'bg-blue-200' : isHighlighted ? 'bg-yellow-100' : 'bg-white'
                }`}
                style={{
                  width: '40px',
                  height: '150px',
                  cursor: 'pointer',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '8px'
                }}
                onMouseDown={() => handleMouseDown(note)}
                onMouseEnter={() => handleMouseEnter(note)}
              >
                {showNoteNames && !isBlackKey(note) && (
                  <span className="text-xs text-gray-600">{getNoteName(note)}</span>
                )}
              </div>
            );
          })}
        </div>
        
        {/* 黑键 */}
        <div className="black-keys absolute top-0 left-0">
          {blackKeys.map(note => {
            const isActive = activeNotes.has(note);
            const isHighlighted = highlightedNotes.includes(note);
            
            // 计算黑键位置
            const whiteKeyIndex = whiteKeys.findIndex(n => n > note);
            const prevWhiteKey = whiteKeyIndex > 0 ? whiteKeys[whiteKeyIndex - 1] : startNote;
            const offset = (note - prevWhiteKey === 1) ? 25 : 65;
            const position = (whiteKeyIndex - 1) * 40 + offset;
            
            return (
              <div
                key={note}
                className={`black-key rounded-b ${
                  isActive ? 'bg-blue-500' : isHighlighted ? 'bg-yellow-500' : 'bg-black'
                }`}
                style={{
                  width: '30px',
                  height: '90px',
                  position: 'absolute',
                  left: `${position}px`,
                  zIndex: 2,
                  cursor: 'pointer'
                }}
                onMouseDown={() => handleMouseDown(note)}
                onMouseEnter={() => handleMouseEnter(note)}
              >
                {showNoteNames && isBlackKey(note) && (
                  <span className="text-xs text-white absolute bottom-2 w-full text-center">
                    {getNoteName(note)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 