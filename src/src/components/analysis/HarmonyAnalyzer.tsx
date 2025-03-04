'use client';

import { useState, useEffect } from 'react';
import { getChordFunction, getCommonProgressions } from '@/lib/theory/musicTheory';
import ChordProgression from '../music/ChordProgression';

// 定义和声分析组件的属性
interface HarmonyAnalyzerProps {
  initialChords?: string[]; // 初始和弦序列
  initialKey?: string; // 初始调性
}

export default function HarmonyAnalyzer({
  initialChords = [],
  initialKey = 'C major'
}: HarmonyAnalyzerProps) {
  // 状态
  const [chords, setChords] = useState<string[]>(initialChords);
  const [key, setKey] = useState<string>(initialKey);
  const [chordInput, setChordInput] = useState<string>('');
  const [keyInput, setKeyInput] = useState<string>(initialKey);
  const [chordFunctions, setChordFunctions] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // 常见调性
  const commonKeys = [
    'C major', 'G major', 'D major', 'A major', 'E major', 'B major', 'F# major',
    'F major', 'Bb major', 'Eb major', 'Ab major', 'Db major', 'Gb major',
    'A minor', 'E minor', 'B minor', 'F# minor', 'C# minor', 'G# minor', 'D# minor',
    'D minor', 'G minor', 'C minor', 'F minor', 'Bb minor', 'Eb minor'
  ];
  
  // 分析和弦功能
  useEffect(() => {
    if (chords.length === 0 || !key) {
      setChordFunctions([]);
      return;
    }
    
    try {
      // 获取每个和弦的功能
      const functions = chords.map(chord => {
        try {
          return getChordFunction(chord, key) || '?';
        } catch {
          return '?';
        }
      });
      
      setChordFunctions(functions);
      setError(null);
    } catch (error) {
      console.error('Error analyzing chord functions:', error);
      setChordFunctions([]);
      setError('无法分析和弦功能');
    }
  }, [chords, key]);
  
  // 获取和弦进行建议
  useEffect(() => {
    if (chords.length === 0 || !key) {
      setSuggestions([]);
      return;
    }
    
    try {
      // 获取常见的后续和弦
      // 由于getCommonProgressions只接受一个参数，我们直接使用key
      const progressions = getCommonProgressions(key);
      
      // 将progressions对象转换为string[][]格式
      const nextChords: string[][] = [];
      Object.values(progressions).forEach(progression => {
        if (progression && progression.chords) {
          const chordNames = progression.chords.map(chord => chord.symbol);
          if (chordNames.length > 0) {
            nextChords.push(chordNames);
          }
        }
      });
      
      setSuggestions(nextChords);
      setError(null);
    } catch (error) {
      console.error('Error getting chord suggestions:', error);
      setSuggestions([]);
      setError('无法获取和弦建议');
    }
  }, [chords, key]);
  
  // 添加和弦
  const addChord = () => {
    if (!chordInput.trim()) return;
    
    setChords([...chords, chordInput.trim()]);
    setChordInput('');
  };
  
  // 添加建议的和弦
  const addSuggestion = (suggestion: string[]) => {
    setChords([...chords, ...suggestion]);
  };
  
  // 更新调性
  const updateKey = () => {
    if (!keyInput.trim()) return;
    
    setKey(keyInput.trim());
  };
  
  // 清除和弦
  const clearChords = () => {
    setChords([]);
    setChordFunctions([]);
    setSuggestions([]);
  };
  
  // 移除最后一个和弦
  const removeLastChord = () => {
    if (chords.length === 0) return;
    
    setChords(chords.slice(0, -1));
  };
  
  return (
    <div className="harmony-analyzer p-4 border border-gray-200 rounded-lg">
      <h3 className="text-xl font-bold mb-4">和声分析工具</h3>
      
      {/* 调性选择 */}
      <div className="key-selection mb-6">
        <h4 className="text-lg font-semibold mb-2">调性</h4>
        <div className="flex">
          <input
            type="text"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded-l-md"
            placeholder="输入调性，如 C major, A minor"
            list="common-keys"
          />
          <datalist id="common-keys">
            {commonKeys.map(k => (
              <option key={k} value={k} />
            ))}
          </datalist>
          <button
            onClick={updateKey}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
          >
            设置
          </button>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          当前调性: {key}
        </div>
      </div>
      
      {/* 和弦输入 */}
      <div className="chord-input mb-6">
        <h4 className="text-lg font-semibold mb-2">添加和弦</h4>
        <div className="flex">
          <input
            type="text"
            value={chordInput}
            onChange={(e) => setChordInput(e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded-l-md"
            placeholder="输入和弦，如 Cmaj7, Dm7, G7"
            onKeyDown={(e) => e.key === 'Enter' && addChord()}
          />
          <button
            onClick={addChord}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
          >
            添加
          </button>
        </div>
      </div>
      
      {/* 和弦控制 */}
      <div className="chord-controls flex space-x-2 mb-6">
        <button
          onClick={removeLastChord}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          disabled={chords.length === 0}
        >
          移除最后一个
        </button>
        <button
          onClick={clearChords}
          className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
          disabled={chords.length === 0}
        >
          清除所有
        </button>
      </div>
      
      {/* 错误信息 */}
      {error && (
        <div className="error-message mb-6 p-3 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      {/* 和弦进行显示 */}
      {chords.length > 0 ? (
        <div className="chord-progression mb-6">
          <h4 className="text-lg font-semibold mb-2">当前和弦进行</h4>
          <ChordProgression
            chords={chords}
            key={key}
            showChordFunctions={true}
          />
        </div>
      ) : (
        <div className="no-chords mb-6 p-4 bg-gray-100 text-gray-600 rounded-md text-center">
          请添加和弦以开始分析
        </div>
      )}
      
      {/* 和弦功能分析 */}
      {chords.length > 0 && chordFunctions.length > 0 && (
        <div className="chord-functions mb-6">
          <h4 className="text-lg font-semibold mb-2">和弦功能分析</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {chords.map((chord, index) => (
              <div key={index} className="p-2 border border-gray-200 rounded-md">
                <div className="font-bold">{chord}</div>
                <div className="text-sm text-gray-600">
                  {chordFunctions[index] !== '?' ? chordFunctions[index] : '未知功能'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 和弦建议 */}
      {chords.length > 0 && suggestions.length > 0 && (
        <div className="chord-suggestions mb-6">
          <h4 className="text-lg font-semibold mb-2">常见后续和弦</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="p-2 border border-gray-200 rounded-md hover:border-blue-300 cursor-pointer"
                onClick={() => addSuggestion(suggestion)}
              >
                <div className="font-bold">{suggestion.join(' → ')}</div>
                <div className="text-sm text-gray-600">
                  点击添加此进行
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 和声分析提示 */}
      <div className="analysis-tips p-4 bg-blue-50 border border-blue-100 rounded-md">
        <h4 className="text-lg font-semibold mb-2">分析提示</h4>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          <li>和弦功能使用罗马数字表示，大写表示大和弦，小写表示小和弦</li>
          <li>I, IV, V 是调性中最重要的和弦，称为主要和弦</li>
          <li>ii, iii, vi, vii 是次要和弦</li>
          <li>常见的和声进行包括：I-IV-V-I, ii-V-I, I-vi-IV-V</li>
          <li>调性转换通常通过共同和弦或导七和弦实现</li>
        </ul>
      </div>
    </div>
  );
} 