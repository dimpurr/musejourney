'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { playChord } from '@/lib/audio/audioEngine';
import PianoKeyboard from '../music/PianoKeyboard';
import TrainingHistory from './TrainingHistory';
import TrainingSettings from './TrainingSettings';
import TrainingProgress from './TrainingProgress';
import { 
  getTypeSettings, 
  updateTypeSettings, 
  addTrainingSession, 
  generateId,
  type ChordTrainingSettings,
  type GeneralSettings,
  type TrainingSettings
} from '@/lib/training/trainingStorage';

// 定义和弦类型
const CHORD_TYPES = [
  { name: '大三和弦', shortName: 'maj', notes: [0, 4, 7] },
  { name: '小三和弦', shortName: 'min', notes: [0, 3, 7] },
  { name: '增三和弦', shortName: 'aug', notes: [0, 4, 8] },
  { name: '减三和弦', shortName: 'dim', notes: [0, 3, 6] },
  { name: '大七和弦', shortName: 'maj7', notes: [0, 4, 7, 11] },
  { name: '属七和弦', shortName: '7', notes: [0, 4, 7, 10] },
  { name: '小七和弦', shortName: 'min7', notes: [0, 3, 7, 10] },
  { name: '半减七和弦', shortName: 'm7b5', notes: [0, 3, 6, 10] },
  { name: '减七和弦', shortName: 'dim7', notes: [0, 3, 6, 9] },
  { name: '挂四和弦', shortName: 'sus4', notes: [0, 5, 7] },
  { name: '挂二和弦', shortName: 'sus2', notes: [0, 2, 7] },
  { name: '六和弦', shortName: '6', notes: [0, 4, 7, 9] }
];

// 定义根音
const ROOT_NOTES = [
  { name: 'C', midi: 60 },
  { name: 'C#', midi: 61 },
  { name: 'D', midi: 62 },
  { name: 'D#', midi: 63 },
  { name: 'E', midi: 64 },
  { name: 'F', midi: 65 },
  { name: 'F#', midi: 66 },
  { name: 'G', midi: 67 },
  { name: 'G#', midi: 68 },
  { name: 'A', midi: 69 },
  { name: 'A#', midi: 70 },
  { name: 'B', midi: 71 }
];

// 定义和弦识别组件的属性
interface ChordIdentifierProps {
  selectedChordTypes?: string[]; // 选择的和弦类型
  identifyRoot?: boolean; // 是否需要识别根音
  identifyType?: boolean; // 是否需要识别和弦类型
}

// 扩展的和弦训练设置，包含通用设置
interface ExtendedChordSettings extends ChordTrainingSettings {
  general?: GeneralSettings;
}

export default function ChordIdentifier({
  selectedChordTypes,
  identifyRoot,
  identifyType
}: ChordIdentifierProps) {
  // 获取设置
  const [settings, setSettings] = useState<ExtendedChordSettings>(() => {
    const chordSettings = getTypeSettings('chord') as ChordTrainingSettings;
    const generalSettings = getTypeSettings('general') as GeneralSettings;
    return { ...chordSettings, general: generalSettings };
  });
  
  // 当前和弦状态
  const [currentChord, setCurrentChord] = useState<{
    root: string;
    rootMidi: number;
    type: string;
    typeName: string;
    midiNotes: number[];
    fullName: string;
  } | null>(null);
  
  // 用户答案状态
  const [userRootAnswer, setUserRootAnswer] = useState<string | null>(null);
  const [userTypeAnswer, setUserTypeAnswer] = useState<string | null>(null);
  const [isRootCorrect, setIsRootCorrect] = useState<boolean | null>(null);
  const [isTypeCorrect, setIsTypeCorrect] = useState<boolean | null>(null);
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
    if (selectedChordTypes) {
      updateTypeSettings('chord', { selectedChordTypes });
      setSettings(prev => ({ ...prev, selectedChordTypes }));
    }
    if (identifyRoot !== undefined) {
      updateTypeSettings('chord', { identifyRoot });
      setSettings(prev => ({ ...prev, identifyRoot }));
    }
    if (identifyType !== undefined) {
      updateTypeSettings('chord', { identifyType });
      setSettings(prev => ({ ...prev, identifyType }));
    }
  }, [selectedChordTypes, identifyRoot, identifyType]);
  
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
      type: 'chord',
      timestamp: sessionStartTime.current,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      duration: sessionDuration,
      settings: { chord: settings }
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
  
  // 生成随机和弦
  const generateChord = useCallback(() => {
    // 如果没有选择任何和弦类型，使用设置中的和弦类型
    const chordTypesToUse = settings.selectedChordTypes.length > 0 
      ? settings.selectedChordTypes 
      : CHORD_TYPES.map(c => c.shortName);
    
    if (chordTypesToUse.length === 0) return;
    
    // 随机选择一个和弦类型
    const chordTypeShortName = chordTypesToUse[Math.floor(Math.random() * chordTypesToUse.length)];
    const chordType = CHORD_TYPES.find(c => c.shortName === chordTypeShortName);
    
    if (!chordType) return;
    
    // 随机选择一个根音
    const rootNote = ROOT_NOTES[Math.floor(Math.random() * ROOT_NOTES.length)];
    
    // 计算和弦中的所有音符
    const midiNotes = chordType.notes.map(interval => rootNote.midi + interval);
    
    // 设置当前和弦
    setCurrentChord({
      root: rootNote.name,
      rootMidi: rootNote.midi,
      type: chordType.shortName,
      typeName: chordType.name,
      midiNotes,
      fullName: `${rootNote.name}${chordType.shortName}`
    });
    
    // 重置用户答案
    setUserRootAnswer(null);
    setUserTypeAnswer(null);
    setIsRootCorrect(null);
    setIsTypeCorrect(null);
    setShowAnswer(false);
    
    // 如果设置了自动播放，则自动播放和弦
    if (settings.general?.autoPlayEnabled) {
      setTimeout(() => {
        playCurrentChord(settings.playbackMode === 'arpeggio');
      }, 500);
    }
  }, [settings]);
  
  // 初始化
  useEffect(() => {
    if (!sessionActive && stats.total === 0) {
      startNewSession();
    }
    generateChord();
  }, [generateChord, sessionActive, stats.total, startNewSession]);
  
  // 播放和弦
  const playCurrentChord = (arpeggio: boolean = false) => {
    if (!currentChord) return;
    
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // 将 MIDI 音符转换为音符名称
    const notes = currentChord.midiNotes.map(midi => {
      const octave = Math.floor(midi / 12) - 1;
      const noteName = noteNames[midi % 12];
      return `${noteName}${octave}`;
    });
    
    if (arpeggio) {
      // 琶音播放
      notes.forEach((note, index) => {
        setTimeout(() => playChord([note], 0.5), index * 500);
      });
    } else {
      // 和弦播放
      playChord(notes, 1);
    }
  };
  
  // 检查根音答案
  const checkRootAnswer = (answer: string) => {
    if (!currentChord || !settings.identifyRoot) return;
    
    setUserRootAnswer(answer);
    const correct = answer === currentChord.root;
    setIsRootCorrect(correct);
    
    // 如果不需要识别和弦类型，或者已经回答了和弦类型，则更新统计信息
    if (!settings.identifyType || userTypeAnswer !== null) {
      updateStats(correct && (settings.identifyType ? isTypeCorrect === true : true));
    }
  };
  
  // 检查和弦类型答案
  const checkTypeAnswer = (answer: string) => {
    if (!currentChord || !settings.identifyType) return;
    
    setUserTypeAnswer(answer);
    const correct = answer === currentChord.type;
    setIsTypeCorrect(correct);
    
    // 如果不需要识别根音，或者已经回答了根音，则更新统计信息
    if (!settings.identifyRoot || userRootAnswer !== null) {
      updateStats((settings.identifyRoot ? isRootCorrect === true : true) && correct);
    }
  };
  
  // 更新统计信息
  const updateStats = (correct: boolean) => {
    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (correct ? 1 : 0),
      streak: correct ? prev.streak + 1 : 0
    }));
  };
  
  // 下一个和弦
  const nextChord = () => {
    generateChord();
  };
  
  // 处理设置变更
  const handleSettingsChange = (newSettings: Partial<TrainingSettings>) => {
    if (newSettings.chord) {
      setSettings(prev => ({ ...prev, ...newSettings.chord }));
    }
    if (newSettings.general) {
      setSettings(prev => ({ ...prev, general: { ...prev.general, ...newSettings.general } }));
    }
  };
  
  // 如果没有当前和弦，显示加载状态
  if (!currentChord) {
    return (
      <div className="chord-identifier p-4 border border-gray-200 rounded-lg">
        <div className="text-center text-gray-500">
          加载和弦识别练习...
        </div>
      </div>
    );
  }
  
  // 检查是否已完成当前和弦的识别
  const isCompleted = 
    (!settings.identifyRoot || userRootAnswer !== null) && 
    (!settings.identifyType || userTypeAnswer !== null);
  
  // 检查是否全部正确
  const isAllCorrect = 
    (!settings.identifyRoot || isRootCorrect === true) && 
    (!settings.identifyType || isTypeCorrect === true);
  
  return (
    <div className="chord-identifier">
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
          <h3 className="text-xl font-bold mb-4">和弦听辨训练</h3>
          
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
              onClick={() => playCurrentChord(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              播放和弦
            </button>
            <button
              onClick={() => playCurrentChord(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              琶音播放
            </button>
          </div>
          
          {/* 根音选择 */}
          {settings.identifyRoot && (
            <div className="root-selection mb-6">
              <h4 className="text-lg font-semibold mb-2">选择根音</h4>
              <div className="grid grid-cols-6 gap-2">
                {ROOT_NOTES.map(root => (
                  <button
                    key={root.name}
                    onClick={() => checkRootAnswer(root.name)}
                    className={`p-2 border rounded-md ${
                      userRootAnswer === root.name
                        ? isRootCorrect
                          ? 'bg-green-100 border-green-500'
                          : 'bg-red-100 border-red-500'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                    disabled={userRootAnswer !== null}
                  >
                    {root.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 和弦类型选择 */}
          {settings.identifyType && (
            <div className="chord-type-selection mb-6">
              <h4 className="text-lg font-semibold mb-2">选择和弦类型</h4>
              <div className="grid grid-cols-3 gap-2">
                {CHORD_TYPES.filter(type => settings.selectedChordTypes.includes(type.shortName)).map(type => (
                  <button
                    key={type.shortName}
                    onClick={() => checkTypeAnswer(type.shortName)}
                    className={`p-2 border rounded-md ${
                      userTypeAnswer === type.shortName
                        ? isTypeCorrect
                          ? 'bg-green-100 border-green-500'
                          : 'bg-red-100 border-red-500'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                    disabled={userTypeAnswer !== null}
                  >
                    {type.name} ({type.shortName})
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 结果和下一步 */}
          {isCompleted && (
            <div className="result mb-6">
              {isAllCorrect ? (
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
                      正确答案是: {currentChord.root}{currentChord.type} ({currentChord.root} {currentChord.typeName})
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex justify-center mt-4">
                <button
                  onClick={nextChord}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  下一个和弦
                </button>
              </div>
            </div>
          )}
          
          {/* 钢琴键盘 */}
          {settings.general?.showKeyboard && (showAnswer || isAllCorrect) && (
            <div className="keyboard-display">
              <PianoKeyboard
                startNote={Math.max(36, Math.min(...currentChord.midiNotes) - 5)}
                endNote={Math.min(84, Math.max(...currentChord.midiNotes) + 5)}
                highlightedNotes={currentChord.midiNotes}
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
          type="chord" 
          currentStats={sessionActive ? { totalQuestions: stats.total, correctAnswers: stats.correct } : undefined}
        />
      )}
      
      {/* 设置内容 */}
      {activeTab === 'settings' && (
        <TrainingSettings 
          type="chord" 
          onSettingsChange={handleSettingsChange}
        />
      )}
      
      {/* 历史内容 */}
      {activeTab === 'history' && (
        <TrainingHistory 
          type="chord"
        />
      )}
    </div>
  );
} 