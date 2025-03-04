'use client';

import { useState, useEffect, useCallback } from 'react';
import { playChordProgression } from '@/lib/audio/audioEngine';
import { getChordInfo } from '@/lib/theory/musicTheory';
import PianoKeyboard from '../music/PianoKeyboard';

// 常见和声进行
const PROGRESSIONS = [
  {
    name: 'I-IV-V-I',
    description: '基础和声进行',
    chords: ['C', 'F', 'G', 'C'],
    romanNumerals: ['I', 'IV', 'V', 'I']
  },
  {
    name: 'I-V-vi-IV',
    description: '流行音乐进行',
    chords: ['C', 'G', 'Am', 'F'],
    romanNumerals: ['I', 'V', 'vi', 'IV']
  },
  {
    name: 'ii-V-I',
    description: '爵士和声进行',
    chords: ['Dm7', 'G7', 'Cmaj7'],
    romanNumerals: ['ii7', 'V7', 'Imaj7']
  },
  {
    name: 'I-vi-IV-V',
    description: '50年代进行',
    chords: ['C', 'Am', 'F', 'G'],
    romanNumerals: ['I', 'vi', 'IV', 'V']
  },
  {
    name: 'vi-IV-I-V',
    description: '悲伤进行',
    chords: ['Am', 'F', 'C', 'G'],
    romanNumerals: ['vi', 'IV', 'I', 'V']
  },
  {
    name: 'I-V-vi-iii-IV-I-IV-V',
    description: '卡农进行',
    chords: ['C', 'G', 'Am', 'Em', 'F', 'C', 'F', 'G'],
    romanNumerals: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V']
  }
];

// 定义组件属性
interface ProgressionTrainerProps {
  selectedProgressions?: string[]; // 选择的和声进行类型
}

export default function ProgressionTrainer({
  selectedProgressions = PROGRESSIONS.map(p => p.name)
}: ProgressionTrainerProps) {
  // 状态
  const [currentProgression, setCurrentProgression] = useState<typeof PROGRESSIONS[0] | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ total: 0, correct: 0 });
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [availableProgressions, setAvailableProgressions] = useState<typeof PROGRESSIONS>([]);
  
  // 初始化可用和声进行
  useEffect(() => {
    const filtered = PROGRESSIONS.filter(p => selectedProgressions.includes(p.name));
    setAvailableProgressions(filtered.length > 0 ? filtered : PROGRESSIONS);
    generateNewProgression(filtered.length > 0 ? filtered : PROGRESSIONS);
  }, [selectedProgressions]);
  
  // 生成新的和声进行
  const generateNewProgression = useCallback((progressions: typeof PROGRESSIONS) => {
    const randomIndex = Math.floor(Math.random() * progressions.length);
    setCurrentProgression(progressions[randomIndex]);
    setIsCorrect(null);
    setActiveNotes([]);
  }, []);
  
  // 播放当前和声进行
  const playCurrentProgression = useCallback(() => {
    if (!currentProgression) return;
    
    // 准备和弦数据
    const chordsWithNotes = currentProgression.chords.map(chord => {
      const chordInfo = getChordInfo(chord);
      if (!chordInfo || !chordInfo.notes) return ['C4', 'E4', 'G4']; // 默认C和弦
      
      // 添加八度信息
      return chordInfo.notes.map(note => {
        if (note.match(/\d$/)) return note; // 已经有八度信息
        return `${note}4`; // 添加默认八度
      });
    });
    
    // 播放和声进行
    playChordProgression(chordsWithNotes, chordsWithNotes.map(() => 1)); // 每个和弦持续1秒
    
    // 更新活跃音符（仅用于视觉反馈）
    const allNotes: number[] = [];
    chordsWithNotes.forEach(chord => {
      chord.forEach(note => {
        const match = note.match(/([A-G][#b]?)(\d+)/);
        if (match) {
          const noteName = match[1];
          const octave = parseInt(match[2]);
          
          // 简单的MIDI音符计算
          const noteMap: Record<string, number> = { 'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 
                                                  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 
                                                  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11 };
          
          if (noteName in noteMap) {
            const midiNote = 12 * (octave + 1) + noteMap[noteName];
            allNotes.push(midiNote);
          }
        }
      });
    });
    
    setActiveNotes(allNotes);
  }, [currentProgression]);
  
  // 检查答案
  const checkAnswer = useCallback((answer: string) => {
    if (!currentProgression) return;
    
    const isAnswerCorrect = answer === currentProgression.name;
    setIsCorrect(isAnswerCorrect);
    
    // 更新统计信息
    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (isAnswerCorrect ? 1 : 0)
    }));
  }, [currentProgression]);
  
  // 下一个和声进行
  const nextProgression = useCallback(() => {
    generateNewProgression(availableProgressions);
  }, [generateNewProgression, availableProgressions]);
  
  return (
    <div className="progression-trainer p-6 max-w-4xl mx-auto">
      {/* 统计信息 */}
      <div className="stats flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <span className="font-bold">总计:</span> {stats.total} 题
        </div>
        <div>
          <span className="font-bold">正确:</span> {stats.correct} 题
        </div>
        <div>
          <span className="font-bold">正确率:</span> {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
        </div>
      </div>
      
      {/* 当前和声进行 */}
      <div className="current-progression mb-8">
        <h3 className="text-xl font-bold mb-4">听辨和声进行</h3>
        
        {currentProgression ? (
          <div className="flex flex-col items-center">
            {/* 播放控制 */}
            <div className="play-controls mb-6">
              <button 
                onClick={playCurrentProgression}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                播放和声进行
              </button>
            </div>
            
            {/* 键盘可视化 */}
            <div className="keyboard-visualization mb-6 w-full">
              <PianoKeyboard 
                startNote={48} // C3
                endNote={84} // C6
                highlightedNotes={activeNotes}
              />
            </div>
            
            {/* 答案选择 */}
            {isCorrect === null ? (
              <div className="answer-options grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
                {PROGRESSIONS.map(progression => (
                  <button
                    key={progression.name}
                    onClick={() => checkAnswer(progression.name)}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-bold">{progression.name}</div>
                    <div className="text-sm text-gray-600">{progression.description}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className={`result p-4 rounded-lg w-full ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                <h4 className="font-bold mb-2">
                  {isCorrect ? '正确!' : '不正确'}
                </h4>
                <p className="mb-2">
                  正确答案: <span className="font-bold">{currentProgression.name}</span> ({currentProgression.description})
                </p>
                <p className="mb-4">
                  和弦: {currentProgression.chords.join(' → ')}
                </p>
                <p className="mb-4">
                  和弦功能: {currentProgression.romanNumerals.join(' → ')}
                </p>
                <button
                  onClick={nextProgression}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  下一个
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            加载和声进行...
          </div>
        )}
      </div>
      
      {/* 提示信息 */}
      <div className="tips p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <h4 className="font-bold mb-2">听辨技巧</h4>
        <ul className="list-disc pl-5 text-sm">
          <li>注意和声进行的情感特点，不同的进行会给人不同的感受</li>
          <li>关注低音部分，它通常定义了和弦的根音</li>
          <li>尝试识别特定的和弦变化模式，如&quot;下行四度&quot;或&quot;上行二度&quot;</li>
          <li>将和声进行与熟悉的歌曲联系起来，建立听觉记忆</li>
        </ul>
      </div>
    </div>
  );
} 