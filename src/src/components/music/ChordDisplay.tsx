'use client';

import { useState, useEffect } from 'react';
import { playChord } from '@/lib/audio/audioEngine';
import { getChordInfo } from '@/lib/theory/musicTheory';
import PianoKeyboard from './PianoKeyboard';

// 定义和弦信息接口
interface ChordInfo {
  symbol: string;
  notes: string[];
  intervals: string[];
  type: string;
  root: string;
  midiNotes: number[];
}

// 定义和弦显示组件的属性
interface ChordDisplayProps {
  chordName: string; // 和弦名称，如 "Cmaj7", "Dm", "G7"
  showKeyboard?: boolean; // 是否显示键盘
  showInfo?: boolean; // 是否显示和弦信息
  baseOctave?: number; // 基础八度，默认为 4 (中央 C 所在八度)
}

export default function ChordDisplay({
  chordName,
  showKeyboard = true,
  showInfo = true,
  baseOctave = 4
}: ChordDisplayProps) {
  // 和弦信息状态
  const [chordInfo, setChordInfo] = useState<ChordInfo | null>(null);
  
  // 加载和弦信息
  useEffect(() => {
    try {
      const info = getChordInfo(chordName);
      
      if (info && info.notes && info.intervals) {
        // 将音符转换为 MIDI 音符编号
        const midiNotes = info.notes.map(note => {
          const noteName = note.slice(0, -1); // 移除八度数字
          const octave = parseInt(note.slice(-1), 10) || baseOctave;
          
          // 计算 MIDI 音符编号
          const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
          const noteIndex = noteNames.indexOf(noteName);
          
          if (noteIndex === -1) return -1;
          return noteIndex + (octave + 1) * 12;
        }).filter(note => note !== -1);
        
        setChordInfo({
          symbol: info.symbol || chordName,
          notes: info.notes,
          intervals: info.intervals,
          type: info.type || '',
          root: info.root || '',
          midiNotes
        });
      }
    } catch (error) {
      console.error('Error parsing chord:', error);
      setChordInfo(null);
    }
  }, [chordName, baseOctave]);
  
  // 播放和弦
  const handlePlayChord = () => {
    if (chordInfo) {
      // 添加八度信息
      const notesWithOctave = chordInfo.notes.map(note => {
        if (note.match(/\d$/)) return note; // 已经有八度信息
        return `${note}${baseOctave}`; // 添加默认八度
      });
      
      playChord(notesWithOctave, 1);
    }
  };
  
  // 如果没有和弦信息，显示加载状态
  if (!chordInfo) {
    return (
      <div className="chord-display p-4 border border-gray-200 rounded-lg">
        <div className="text-center text-gray-500">
          {chordName ? '加载和弦信息...' : '请输入和弦名称'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="chord-display p-4 border border-gray-200 rounded-lg">
      {/* 和弦标题和播放按钮 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{chordInfo.symbol}</h3>
        <button
          onClick={handlePlayChord}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          播放和弦
        </button>
      </div>
      
      {/* 和弦信息 */}
      {showInfo && (
        <div className="chord-info grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-600">根音</h4>
            <p>{chordInfo.root}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600">类型</h4>
            <p>{chordInfo.type || '基本'}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600">音符</h4>
            <p>{chordInfo.notes.join(', ')}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600">音程</h4>
            <p>{chordInfo.intervals.join(', ')}</p>
          </div>
        </div>
      )}
      
      {/* 和弦可视化 */}
      <div className="chord-visualization mb-4">
        <div className="flex space-x-2">
          {chordInfo.notes.map((note, index) => {
            const noteName = note.slice(0, -1) || note; // 移除八度数字，如果有的话
            
            return (
              <div 
                key={index}
                className="flex flex-col items-center"
              >
                <div 
                  className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold"
                >
                  {noteName}
                </div>
                <div className="text-xs mt-1 text-gray-600">
                  {chordInfo.intervals[index]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 钢琴键盘 */}
      {showKeyboard && chordInfo.midiNotes.length > 0 && (
        <div className="chord-keyboard">
          <PianoKeyboard
            startNote={Math.max(36, Math.min(...chordInfo.midiNotes) - 5)}
            endNote={Math.min(84, Math.max(...chordInfo.midiNotes) + 5)}
            highlightedNotes={chordInfo.midiNotes}
          />
        </div>
      )}
    </div>
  );
} 