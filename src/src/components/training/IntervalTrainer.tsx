'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { playNote } from '@/lib/audio/audioEngine';
import PianoKeyboard from '../music/PianoKeyboard';
import TrainingHistory from './TrainingHistory';
import TrainingSettings from './TrainingSettings';
import TrainingProgress from './TrainingProgress';
import { 
  getTypeSettings, 
  updateTypeSettings, 
  addTrainingSession, 
  generateId,
  type IntervalTrainingSettings,
  type GeneralSettings,
  type TrainingSettings
} from '@/lib/training/trainingStorage';

// 定义音程类型
const INTERVALS = [
  { name: '小二度', shortName: 'm2', semitones: 1 },
  { name: '大二度', shortName: 'M2', semitones: 2 },
  { name: '小三度', shortName: 'm3', semitones: 3 },
  { name: '大三度', shortName: 'M3', semitones: 4 },
  { name: '纯四度', shortName: 'P4', semitones: 5 },
  { name: '增四度/减五度', shortName: 'A4/d5', semitones: 6 },
  { name: '纯五度', shortName: 'P5', semitones: 7 },
  { name: '小六度', shortName: 'm6', semitones: 8 },
  { name: '大六度', shortName: 'M6', semitones: 9 },
  { name: '小七度', shortName: 'm7', semitones: 10 },
  { name: '大七度', shortName: 'M7', semitones: 11 },
  { name: '纯八度', shortName: 'P8', semitones: 12 }
];

// 定义音程练习组件的属性
interface IntervalTrainerProps {
  selectedIntervals?: string[]; // 选择的音程类型
}

// 扩展的音程训练设置，包含通用设置
interface ExtendedIntervalSettings extends IntervalTrainingSettings {
  general?: GeneralSettings;
}

export default function IntervalTrainer({
  selectedIntervals
}: IntervalTrainerProps) {
  // 获取设置
  const [settings, setSettings] = useState<ExtendedIntervalSettings>(() => {
    const intervalSettings = getTypeSettings('interval') as IntervalTrainingSettings;
    const generalSettings = getTypeSettings('general') as GeneralSettings;
    return { ...intervalSettings, general: generalSettings };
  });
  
  // 当前音程状态
  const [currentInterval, setCurrentInterval] = useState<{
    firstNote: string;
    secondNote: string;
    intervalName: string;
    intervalShortName: string;
    firstNoteMidi: number;
    secondNoteMidi: number;
  } | null>(null);
  
  // 用户答案状态
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // 统计信息
  const [stats, setStats] = useState({
    total: 0,
    correct: 0,
    streak: 0
  });
  
  // 训练会话
  const [sessionActive, setSessionActive] = useState(false);
  const sessionStartTime = useRef<number>(0);
  const [sessionId, setSessionId] = useState<string>('');
  
  // UI 状态
  const [activeTab, setActiveTab] = useState<'train' | 'progress' | 'settings' | 'history'>('train');
  
  // 初始化设置
  useEffect(() => {
    if (selectedIntervals) {
      updateTypeSettings('interval', { selectedIntervals });
      setSettings(prev => ({ ...prev, selectedIntervals }));
    }
  }, [selectedIntervals]);
  
  // 开始新会话
  const startNewSession = useCallback(() => {
    setSessionActive(true);
    sessionStartTime.current = Date.now();
    setSessionId(generateId());
    setStats({
      total: 0,
      correct: 0,
      streak: 0
    });
  }, []);
  
  // 结束会话
  const endSession = useCallback(() => {
    if (!sessionActive) return;
    
    const sessionDuration = Math.round((Date.now() - sessionStartTime.current) / 1000);
    
    // 添加训练会话记录
    addTrainingSession({
      id: sessionId,
      type: 'interval',
      timestamp: sessionStartTime.current,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      duration: sessionDuration,
      settings: { interval: settings }
    });
    
    setSessionActive(false);
  }, [sessionActive, sessionId, stats, settings]);
  
  // 组件卸载时结束会话
  useEffect(() => {
    return () => {
      if (sessionActive) {
        endSession();
      }
    };
  }, [sessionActive, endSession]);
  
  // 生成随机音程
  const generateInterval = useCallback(() => {
    // 如果没有选择任何音程，使用设置中的音程
    const intervalsToUse = settings.selectedIntervals.length > 0 
      ? settings.selectedIntervals 
      : INTERVALS.map(i => i.shortName);
    
    if (intervalsToUse.length === 0) return;
    
    // 随机选择一个音程
    const intervalShortName = intervalsToUse[Math.floor(Math.random() * intervalsToUse.length)];
    const interval = INTERVALS.find(i => i.shortName === intervalShortName);
    
    if (!interval) return;
    
    // 随机选择一个起始音符 (C3-C5)
    const startMidi = 48 + Math.floor(Math.random() * 24); // C3(48) to C5(72)
    const endMidi = startMidi + interval.semitones;
    
    // 将 MIDI 音符转换为音符名称
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const firstNoteOctave = Math.floor(startMidi / 12) - 1;
    const firstNoteName = noteNames[startMidi % 12];
    const secondNoteOctave = Math.floor(endMidi / 12) - 1;
    const secondNoteName = noteNames[endMidi % 12];
    
    // 设置当前音程
    setCurrentInterval({
      firstNote: `${firstNoteName}${firstNoteOctave}`,
      secondNote: `${secondNoteName}${secondNoteOctave}`,
      intervalName: interval.name,
      intervalShortName: interval.shortName,
      firstNoteMidi: startMidi,
      secondNoteMidi: endMidi
    });
    
    // 重置用户答案
    setUserAnswer(null);
    setIsCorrect(null);
    setShowAnswer(false);
    
    // 如果设置了自动播放，则自动播放音程
    if (settings.general?.autoPlayEnabled) {
      setTimeout(() => {
        playInterval(settings.playbackMode);
      }, 500);
    }
  }, [settings]);
  
  // 初始化
  useEffect(() => {
    if (!sessionActive && stats.total === 0) {
      startNewSession();
    }
    generateInterval();
  }, [generateInterval, sessionActive, stats.total, startNewSession]);
  
  // 播放音程
  const playInterval = (mode: 'ascending' | 'descending' | 'harmonic' | 'random' = 'ascending') => {
    if (!currentInterval) return;
    
    const { firstNote, secondNote } = currentInterval;
    
    // 如果模式是随机的，则随机选择一种播放方式
    if (mode === 'random') {
      const modes = ['ascending', 'descending', 'harmonic'];
      mode = modes[Math.floor(Math.random() * modes.length)] as 'ascending' | 'descending' | 'harmonic';
    }
    
    if (mode === 'ascending') {
      playNote(firstNote, 0.5);
      setTimeout(() => playNote(secondNote, 0.5), 1000);
    } else if (mode === 'descending') {
      playNote(secondNote, 0.5);
      setTimeout(() => playNote(firstNote, 0.5), 1000);
    } else {
      playNote(firstNote, 0.5);
      playNote(secondNote, 0.5);
    }
  };
  
  // 检查答案
  const checkAnswer = (answer: string) => {
    if (!currentInterval || userAnswer !== null) return;
    
    setUserAnswer(answer);
    const correct = answer === currentInterval.intervalShortName;
    setIsCorrect(correct);
    
    // 更新统计信息
    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (correct ? 1 : 0),
      streak: correct ? prev.streak + 1 : 0
    }));
  };
  
  // 下一个音程
  const nextInterval = () => {
    generateInterval();
  };
  
  // 处理设置变更
  const handleSettingsChange = (newSettings: Partial<TrainingSettings>) => {
    if (newSettings.interval) {
      setSettings(prev => ({ ...prev, ...newSettings.interval }));
    }
    if (newSettings.general) {
      setSettings(prev => ({ ...prev, general: { ...prev.general, ...newSettings.general } }));
    }
  };
  
  // 如果没有当前音程，显示加载状态
  if (!currentInterval) {
    return (
      <div className="interval-trainer p-4 border border-gray-200 rounded-lg">
        <div className="text-center text-gray-500">
          加载音程练习...
        </div>
      </div>
    );
  }
  
  return (
    <div className="interval-trainer">
      {/* 标签页导航 */}
      <div className="tabs flex border-b mb-4">
        <button
          onClick={() => setActiveTab('train')}
          className={`px-4 py-2 ${
            activeTab === 'train' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
              : 'text-gray-600 hover:text-blue-500'
          }`}
        >
          训练
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-2 ${
            activeTab === 'progress' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
              : 'text-gray-600 hover:text-blue-500'
          }`}
        >
          进度
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 ${
            activeTab === 'settings' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
              : 'text-gray-600 hover:text-blue-500'
          }`}
        >
          设置
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 ${
            activeTab === 'history' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
              : 'text-gray-600 hover:text-blue-500'
          }`}
        >
          历史
        </button>
      </div>
      
      {/* 训练内容 */}
      {activeTab === 'train' && (
        <div className="training-content p-4 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-bold mb-4">音程听辨训练</h3>
          
          {/* 统计信息 */}
          <div className="stats flex justify-between mb-6">
            <div className="stat">
              <div className="text-sm text-gray-600">总计</div>
              <div className="text-lg font-bold">{stats.total}</div>
            </div>
            <div className="stat">
              <div className="text-sm text-gray-600">正确</div>
              <div className="text-lg font-bold">{stats.correct}</div>
            </div>
            <div className="stat">
              <div className="text-sm text-gray-600">正确率</div>
              <div className="text-lg font-bold">
                {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
              </div>
            </div>
            <div className="stat">
              <div className="text-sm text-gray-600">连续正确</div>
              <div className="text-lg font-bold">{stats.streak}</div>
            </div>
          </div>
          
          {/* 播放控制 */}
          <div className="play-controls flex justify-center space-x-4 mb-6">
            <button
              onClick={() => playInterval('ascending')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              上行播放
            </button>
            <button
              onClick={() => playInterval('descending')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              下行播放
            </button>
            <button
              onClick={() => playInterval('harmonic')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              和声播放
            </button>
          </div>
          
          {/* 答案选择 */}
          <div className="answer-options grid grid-cols-3 gap-2 mb-6">
            {INTERVALS.map(interval => (
              <button
                key={interval.shortName}
                onClick={() => checkAnswer(interval.shortName)}
                className={`p-2 border rounded-md ${
                  userAnswer === interval.shortName
                    ? isCorrect
                      ? 'bg-green-100 border-green-500'
                      : 'bg-red-100 border-red-500'
                    : 'border-gray-300 hover:border-blue-500'
                }`}
                disabled={userAnswer !== null}
              >
                {interval.name} ({interval.shortName})
              </button>
            ))}
          </div>
          
          {/* 结果和下一步 */}
          {userAnswer && (
            <div className="result mb-6">
              {isCorrect ? (
                <div className="text-green-600 font-bold text-center">
                  正确！
                </div>
              ) : (
                <div className="text-red-600 font-bold text-center">
                  错误。
                  {!showAnswer ? (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="ml-2 text-blue-600 underline"
                    >
                      显示答案
                    </button>
                  ) : (
                    <span className="ml-2">
                      正确答案是: {currentInterval.intervalName} ({currentInterval.intervalShortName})
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex justify-center mt-4">
                <button
                  onClick={nextInterval}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  下一个音程
                </button>
              </div>
            </div>
          )}
          
          {/* 钢琴键盘 */}
          {settings.general?.showKeyboard && (showAnswer || isCorrect) && (
            <div className="keyboard-display">
              <PianoKeyboard
                startNote={Math.max(36, currentInterval.firstNoteMidi - 5)}
                endNote={Math.min(84, currentInterval.secondNoteMidi + 5)}
                highlightedNotes={[currentInterval.firstNoteMidi, currentInterval.secondNoteMidi]}
              />
            </div>
          )}
          
          {/* 会话控制 */}
          <div className="session-controls flex justify-center mt-6">
            {sessionActive ? (
              <button
                onClick={endSession}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                结束会话
              </button>
            ) : (
              <button
                onClick={startNewSession}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                开始新会话
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* 进度内容 */}
      {activeTab === 'progress' && (
        <TrainingProgress 
          type="interval" 
          currentStats={sessionActive ? { totalQuestions: stats.total, correctAnswers: stats.correct } : undefined}
        />
      )}
      
      {/* 设置内容 */}
      {activeTab === 'settings' && (
        <TrainingSettings 
          type="interval" 
          onSettingsChange={handleSettingsChange}
        />
      )}
      
      {/* 历史内容 */}
      {activeTab === 'history' && (
        <TrainingHistory 
          type="interval"
        />
      )}
    </div>
  );
} 