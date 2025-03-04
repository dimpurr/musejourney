'use client';

import { useState, useEffect } from 'react';
import { playChordProgression } from '@/lib/audio/audioEngine';
import { getChordInfo, getChordFunction } from '@/lib/theory/musicTheory';
import ChordDisplay from './ChordDisplay';

// 定义和声进行组件的属性
interface ChordProgressionProps {
  chords: string[]; // 和弦名称数组，如 ["Cmaj7", "Dm7", "G7", "Cmaj7"]
  key?: string; // 调性，如 "C major", "A minor"
  showChordFunctions?: boolean; // 是否显示和弦功能
  baseOctave?: number; // 基础八度，默认为 4 (中央 C 所在八度)
}

export default function ChordProgression({
  chords,
  key = '',
  showChordFunctions = true,
  baseOctave = 4
}: ChordProgressionProps) {
  // 和弦信息状态
  const [chordInfos, setChordInfos] = useState<Array<{
    chord: string;
    notes: string[];
    function?: string;
  }>>([]);
  
  // 加载和弦信息
  useEffect(() => {
    try {
      const infos = chords.map(chord => {
        try {
          const info = getChordInfo(chord);
          let chordFunction = '';
          
          if (key && showChordFunctions) {
            try {
              // 确保 key 不为 null
              const keyString = key || '';
              chordFunction = getChordFunction(chord, keyString) || '';
            } catch (e) {
              console.warn(`Could not determine function for chord ${chord} in key ${key}:`, e);
            }
          }
          
          return {
            chord,
            notes: info && info.notes ? info.notes : [],
            function: chordFunction
          };
        } catch (e) {
          console.warn(`Could not parse chord ${chord}:`, e);
          return {
            chord,
            notes: [],
            function: ''
          };
        }
      });
      
      setChordInfos(infos);
    } catch (error) {
      console.error('Error parsing chord progression:', error);
      setChordInfos([]);
    }
  }, [chords, key, showChordFunctions]);
  
  // 播放和声进行
  const handlePlayProgression = () => {
    if (chordInfos.length > 0) {
      // 准备和弦数据
      const chordsWithNotes = chordInfos.map(info => {
        // 添加八度信息
        return info.notes.map(note => {
          if (note.match(/\d$/)) return note; // 已经有八度信息
          return `${note}${baseOctave}`; // 添加默认八度
        });
      });
      
      // 播放和声进行
      playChordProgression(chordsWithNotes, chordsWithNotes.map(() => 1)); // 每个和弦持续 1 秒
    }
  };
  
  // 如果没有和弦信息，显示加载状态
  if (chordInfos.length === 0) {
    return (
      <div className="chord-progression p-4 border border-gray-200 rounded-lg">
        <div className="text-center text-gray-500">
          {chords.length > 0 ? '加载和声进行信息...' : '请输入和声进行'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="chord-progression p-4 border border-gray-200 rounded-lg">
      {/* 标题和播放按钮 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">
          和声进行 {key && `(${key})`}
        </h3>
        <button
          onClick={handlePlayProgression}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          播放进行
        </button>
      </div>
      
      {/* 和弦进行可视化 */}
      <div className="progression-visualization mb-6">
        <div className="flex flex-wrap gap-2">
          {chordInfos.map((info, index) => (
            <div 
              key={index}
              className="flex flex-col items-center"
            >
              <div className="flex items-center">
                <div className="text-lg font-bold mr-2">{info.chord}</div>
                {index < chordInfos.length - 1 && (
                  <div className="text-gray-400 mx-2">→</div>
                )}
              </div>
              {showChordFunctions && info.function && (
                <div className="text-xs text-gray-600 mt-1">
                  {info.function}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 单个和弦详情 */}
      <div className="chord-details">
        <h4 className="text-lg font-semibold mb-3">和弦详情</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {chordInfos.map((info, index) => (
            <div key={index} className="chord-detail">
              <ChordDisplay 
                chordName={info.chord}
                showKeyboard={false}
                baseOctave={baseOctave}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 