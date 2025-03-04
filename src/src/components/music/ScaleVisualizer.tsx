'use client';

import { useState, useEffect } from 'react';
import { playScale } from '@/lib/audio/audioEngine';
import { getScaleInfo } from '@/lib/theory/musicTheory';
import PianoKeyboard from './PianoKeyboard';

// 定义音阶信息接口
interface ScaleInfo {
  name: string;
  tonic: string;
  type: string;
  notes: string[];
  intervals: string[];
  midiNotes: number[];
}

// 定义音阶可视化组件的属性
interface ScaleVisualizerProps {
  scaleName: string; // 音阶名称，如 "C major", "D minor", "F# dorian"
  showKeyboard?: boolean; // 是否显示键盘
  showInfo?: boolean; // 是否显示音阶信息
  baseOctave?: number; // 基础八度，默认为 4 (中央 C 所在八度)
}

export default function ScaleVisualizer({
  scaleName,
  showKeyboard = true,
  showInfo = true,
  baseOctave = 4
}: ScaleVisualizerProps) {
  // 音阶信息状态
  const [scaleInfo, setScaleInfo] = useState<ScaleInfo | null>(null);
  
  // 加载音阶信息
  useEffect(() => {
    try {
      const info = getScaleInfo(scaleName);
      
      if (info && info.notes) {
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
        
        setScaleInfo({
          name: info.name || scaleName,
          tonic: info.tonic || '',
          type: info.type || '',
          notes: info.notes,
          intervals: info.intervals || [],
          midiNotes
        });
      }
    } catch (error) {
      console.error('Error parsing scale:', error);
      setScaleInfo(null);
    }
  }, [scaleName, baseOctave]);
  
  // 播放音阶
  const handlePlayScale = (direction: 'up' | 'down' | 'both' = 'up') => {
    if (scaleInfo) {
      // 添加八度信息
      const notesWithOctave = scaleInfo.notes.map(note => {
        if (note.match(/\d$/)) return note; // 已经有八度信息
        return `${note}${baseOctave}`; // 添加默认八度
      });
      
      playScale(notesWithOctave, 0.3, direction);
    }
  };
  
  // 如果没有音阶信息，显示加载状态
  if (!scaleInfo) {
    return (
      <div className="scale-visualizer p-4 border border-gray-200 rounded-lg">
        <div className="text-center text-gray-500">
          {scaleName ? '加载音阶信息...' : '请输入音阶名称'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="scale-visualizer p-4 border border-gray-200 rounded-lg">
      {/* 音阶标题和播放按钮 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{scaleInfo.name}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePlayScale('up')}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            上行
          </button>
          <button
            onClick={() => handlePlayScale('down')}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            下行
          </button>
          <button
            onClick={() => handlePlayScale('both')}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            上下行
          </button>
        </div>
      </div>
      
      {/* 音阶信息 */}
      {showInfo && (
        <div className="scale-info grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-600">调式中心</h4>
            <p>{scaleInfo.tonic}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600">类型</h4>
            <p>{scaleInfo.type}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600">音符</h4>
            <p>{scaleInfo.notes.join(', ')}</p>
          </div>
          {scaleInfo.intervals.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600">音程</h4>
              <p>{scaleInfo.intervals.join(', ')}</p>
            </div>
          )}
        </div>
      )}
      
      {/* 音阶可视化 */}
      <div className="scale-visualization mb-4">
        <div className="flex flex-wrap gap-2">
          {scaleInfo.notes.map((note, index) => {
            const noteName = note.slice(0, -1) || note; // 移除八度数字，如果有的话
            const isRoot = index === 0;
            
            return (
              <div 
                key={index}
                className="flex flex-col items-center"
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    isRoot ? 'bg-blue-600' : 'bg-blue-400'
                  }`}
                >
                  {noteName}
                </div>
                {scaleInfo.intervals.length > 0 && (
                  <div className="text-xs mt-1 text-gray-600">
                    {scaleInfo.intervals[index] || ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 钢琴键盘 */}
      {showKeyboard && scaleInfo.midiNotes.length > 0 && (
        <div className="scale-keyboard">
          <PianoKeyboard
            startNote={Math.max(36, Math.min(...scaleInfo.midiNotes) - 5)}
            endNote={Math.min(84, Math.max(...scaleInfo.midiNotes) + 5)}
            highlightedNotes={scaleInfo.midiNotes}
          />
        </div>
      )}
    </div>
  );
} 