'use client';

import { useState } from 'react';
import { 
  getTrainingSettings, 
  saveTrainingSettings, 
  type TrainingSettings,
  TrainingType,
  type IntervalTrainingSettings,
  type ChordTrainingSettings,
  type ProgressionTrainingSettings
} from '@/lib/training/trainingStorage';

// 音程常量
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

// 和弦类型常量
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

// 和弦进行常量
const PROGRESSIONS = [
  { name: 'I-IV-V-I', description: '基础和声进行' },
  { name: 'I-V-vi-IV', description: '流行音乐进行' },
  { name: 'ii-V-I', description: '爵士和声进行' },
  { name: 'I-vi-IV-V', description: '50年代进行' },
  { name: 'vi-IV-I-V', description: '悲伤进行' },
  { name: 'I-V-vi-iii-IV-I-IV-V', description: '卡农进行' }
];

// 难度预设
const DIFFICULTY_PRESETS = {
  beginner: {
    interval: {
      selectedIntervals: ['M2', 'M3', 'P4', 'P5', 'P8']
    },
    chord: {
      selectedChordTypes: ['maj', 'min']
    },
    progression: {
      selectedProgressions: ['I-IV-V-I', 'I-V-vi-IV']
    }
  },
  intermediate: {
    interval: {
      selectedIntervals: ['m2', 'M2', 'm3', 'M3', 'P4', 'P5', 'm6', 'M6', 'P8']
    },
    chord: {
      selectedChordTypes: ['maj', 'min', 'aug', 'dim', 'maj7', '7']
    },
    progression: {
      selectedProgressions: ['I-IV-V-I', 'I-V-vi-IV', 'ii-V-I', 'I-vi-IV-V']
    }
  },
  advanced: {
    interval: {
      selectedIntervals: ['m2', 'M2', 'm3', 'M3', 'P4', 'A4/d5', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8']
    },
    chord: {
      selectedChordTypes: ['maj', 'min', 'aug', 'dim', 'maj7', '7', 'min7', 'm7b5', 'dim7', 'sus4', 'sus2', '6']
    },
    progression: {
      selectedProgressions: ['I-IV-V-I', 'I-V-vi-IV', 'ii-V-I', 'I-vi-IV-V', 'vi-IV-I-V', 'I-V-vi-iii-IV-I-IV-V']
    }
  }
};

interface TrainingSettingsProps {
  type: TrainingType;
  onSettingsChange?: (settings: Partial<TrainingSettings>) => void;
  className?: string;
}

export default function TrainingSettings({
  type,
  onSettingsChange,
  className = ''
}: TrainingSettingsProps) {
  const [settings, setSettings] = useState<TrainingSettings>(getTrainingSettings());
  const [isDirty, setIsDirty] = useState(false);

  // 获取特定类型的设置
  const getTypedSettings = <T extends keyof TrainingSettings>(type: T): TrainingSettings[T] => {
    return settings[type];
  };

  // 更新设置
  const updateSettings = <T extends keyof TrainingSettings>(
    settingType: T,
    newSettings: Partial<TrainingSettings[T]>
  ) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        [settingType]: {
          ...prev[settingType],
          ...newSettings
        }
      };
      setIsDirty(true);
      return updated;
    });
  };

  // 保存设置
  const saveSettings = () => {
    saveTrainingSettings(settings);
    setIsDirty(false);
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  };

  // 重置设置
  const resetSettings = () => {
    const defaultSettings = getTrainingSettings();
    setSettings(defaultSettings);
    saveTrainingSettings(defaultSettings);
    setIsDirty(false);
    if (onSettingsChange) {
      onSettingsChange(defaultSettings);
    }
  };

  // 设置难度
  const setDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    const currentSettings = { ...settings };
    
    // 更新音程设置
    if (type === 'interval') {
      const intervalSettings = currentSettings.interval as IntervalTrainingSettings;
      intervalSettings.selectedIntervals = [...DIFFICULTY_PRESETS[difficulty].interval.selectedIntervals];
      intervalSettings.difficulty = difficulty;
    }
    
    // 更新和弦设置
    if (type === 'chord') {
      const chordSettings = currentSettings.chord as ChordTrainingSettings;
      chordSettings.selectedChordTypes = [...DIFFICULTY_PRESETS[difficulty].chord.selectedChordTypes];
      chordSettings.difficulty = difficulty;
    }
    
    // 更新和弦进行设置
    if (type === 'progression') {
      const progressionSettings = currentSettings.progression as ProgressionTrainingSettings;
      progressionSettings.selectedProgressions = [...DIFFICULTY_PRESETS[difficulty].progression.selectedProgressions];
      progressionSettings.difficulty = difficulty;
    }
    
    setSettings(currentSettings);
    setIsDirty(true);
  };

  // 处理音程选择变化
  const handleIntervalChange = (shortName: string, checked: boolean) => {
    const intervalSettings = getTypedSettings('interval') as IntervalTrainingSettings;
    const selectedIntervals = [...intervalSettings.selectedIntervals];
    
    if (checked && !selectedIntervals.includes(shortName)) {
      selectedIntervals.push(shortName);
    } else if (!checked && selectedIntervals.includes(shortName)) {
      const index = selectedIntervals.indexOf(shortName);
      selectedIntervals.splice(index, 1);
    }
    
    updateSettings('interval', { selectedIntervals });
  };

  // 处理和弦类型选择变化
  const handleChordTypeChange = (shortName: string, checked: boolean) => {
    const chordSettings = getTypedSettings('chord') as ChordTrainingSettings;
    const selectedChordTypes = [...chordSettings.selectedChordTypes];
    
    if (checked && !selectedChordTypes.includes(shortName)) {
      selectedChordTypes.push(shortName);
    } else if (!checked && selectedChordTypes.includes(shortName)) {
      const index = selectedChordTypes.indexOf(shortName);
      selectedChordTypes.splice(index, 1);
    }
    
    updateSettings('chord', { selectedChordTypes });
  };

  // 处理和弦进行选择变化
  const handleProgressionChange = (name: string, checked: boolean) => {
    const progressionSettings = getTypedSettings('progression') as ProgressionTrainingSettings;
    const selectedProgressions = [...progressionSettings.selectedProgressions];
    
    if (checked && !selectedProgressions.includes(name)) {
      selectedProgressions.push(name);
    } else if (!checked && selectedProgressions.includes(name)) {
      const index = selectedProgressions.indexOf(name);
      selectedProgressions.splice(index, 1);
    }
    
    updateSettings('progression', { selectedProgressions });
  };

  // 处理播放模式变化
  const handlePlaybackModeChange = (mode: string) => {
    if (type === 'interval') {
      updateSettings('interval', { 
        playbackMode: mode as IntervalTrainingSettings['playbackMode'] 
      });
    } else if (type === 'chord') {
      updateSettings('chord', { 
        playbackMode: mode as ChordTrainingSettings['playbackMode'] 
      });
    }
  };

  // 处理识别选项变化
  const handleIdentifyOptionChange = (option: 'root' | 'type', checked: boolean) => {
    if (type === 'chord') {
      if (option === 'root') {
        updateSettings('chord', { identifyRoot: checked });
      } else {
        updateSettings('chord', { identifyType: checked });
      }
    }
  };

  // 处理通用设置变化
  const handleGeneralSettingChange = <K extends keyof TrainingSettings['general']>(
    setting: K, 
    value: TrainingSettings['general'][K]
  ) => {
    updateSettings('general', { [setting]: value } as Partial<TrainingSettings['general']>);
  };

  return (
    <div className={`training-settings p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">训练设置</h3>
        <div className="flex space-x-2">
          <button
            onClick={saveSettings}
            disabled={!isDirty}
            className={`px-3 py-1 text-sm rounded-md ${
              isDirty
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            保存设置
          </button>
          <button
            onClick={resetSettings}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            重置
          </button>
        </div>
      </div>
      
      {/* 难度选择 */}
      <div className="difficulty-selection mb-6">
        <h4 className="text-lg font-semibold mb-2">难度</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => setDifficulty('beginner')}
            className={`px-4 py-2 rounded-md ${
              getTypedSettings(type).difficulty === 'beginner'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            初级
          </button>
          <button
            onClick={() => setDifficulty('intermediate')}
            className={`px-4 py-2 rounded-md ${
              getTypedSettings(type).difficulty === 'intermediate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            中级
          </button>
          <button
            onClick={() => setDifficulty('advanced')}
            className={`px-4 py-2 rounded-md ${
              getTypedSettings(type).difficulty === 'advanced'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            高级
          </button>
        </div>
      </div>
      
      {/* 音程设置 */}
      {type === 'interval' && (
        <div className="interval-settings mb-6">
          <h4 className="text-lg font-semibold mb-2">音程选择</h4>
          <div className="grid grid-cols-3 gap-2">
            {INTERVALS.map(interval => (
              <label key={interval.shortName} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(getTypedSettings('interval') as IntervalTrainingSettings).selectedIntervals.includes(interval.shortName)}
                  onChange={(e) => handleIntervalChange(interval.shortName, e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span>{interval.name} ({interval.shortName})</span>
              </label>
            ))}
          </div>
          
          <h4 className="text-lg font-semibold mt-4 mb-2">播放模式</h4>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="intervalPlaybackMode"
                value="ascending"
                checked={(getTypedSettings('interval') as IntervalTrainingSettings).playbackMode === 'ascending'}
                onChange={() => handlePlaybackModeChange('ascending')}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span>上行播放</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="intervalPlaybackMode"
                value="descending"
                checked={(getTypedSettings('interval') as IntervalTrainingSettings).playbackMode === 'descending'}
                onChange={() => handlePlaybackModeChange('descending')}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span>下行播放</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="intervalPlaybackMode"
                value="harmonic"
                checked={(getTypedSettings('interval') as IntervalTrainingSettings).playbackMode === 'harmonic'}
                onChange={() => handlePlaybackModeChange('harmonic')}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span>和声播放</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="intervalPlaybackMode"
                value="random"
                checked={(getTypedSettings('interval') as IntervalTrainingSettings).playbackMode === 'random'}
                onChange={() => handlePlaybackModeChange('random')}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span>随机播放</span>
            </label>
          </div>
        </div>
      )}
      
      {/* 和弦设置 */}
      {type === 'chord' && (
        <div className="chord-settings mb-6">
          <h4 className="text-lg font-semibold mb-2">和弦类型选择</h4>
          <div className="grid grid-cols-3 gap-2">
            {CHORD_TYPES.map(chordType => (
              <label key={chordType.shortName} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(getTypedSettings('chord') as ChordTrainingSettings).selectedChordTypes.includes(chordType.shortName)}
                  onChange={(e) => handleChordTypeChange(chordType.shortName, e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span>{chordType.name} ({chordType.shortName})</span>
              </label>
            ))}
          </div>
          
          <h4 className="text-lg font-semibold mt-4 mb-2">识别选项</h4>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(getTypedSettings('chord') as ChordTrainingSettings).identifyRoot}
                onChange={(e) => handleIdentifyOptionChange('root', e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span>识别根音</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(getTypedSettings('chord') as ChordTrainingSettings).identifyType}
                onChange={(e) => handleIdentifyOptionChange('type', e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span>识别和弦类型</span>
            </label>
          </div>
          
          <h4 className="text-lg font-semibold mt-4 mb-2">播放模式</h4>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="chordPlaybackMode"
                value="block"
                checked={(getTypedSettings('chord') as ChordTrainingSettings).playbackMode === 'block'}
                onChange={() => handlePlaybackModeChange('block')}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span>和弦播放</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="chordPlaybackMode"
                value="arpeggio"
                checked={(getTypedSettings('chord') as ChordTrainingSettings).playbackMode === 'arpeggio'}
                onChange={() => handlePlaybackModeChange('arpeggio')}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span>琶音播放</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="chordPlaybackMode"
                value="random"
                checked={(getTypedSettings('chord') as ChordTrainingSettings).playbackMode === 'random'}
                onChange={() => handlePlaybackModeChange('random')}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span>随机播放</span>
            </label>
          </div>
        </div>
      )}
      
      {/* 和弦进行设置 */}
      {type === 'progression' && (
        <div className="progression-settings mb-6">
          <h4 className="text-lg font-semibold mb-2">和弦进行选择</h4>
          <div className="grid grid-cols-2 gap-2">
            {PROGRESSIONS.map(progression => (
              <label key={progression.name} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(getTypedSettings('progression') as ProgressionTrainingSettings).selectedProgressions.includes(progression.name)}
                  onChange={(e) => handleProgressionChange(progression.name, e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span>{progression.name} ({progression.description})</span>
              </label>
            ))}
          </div>
        </div>
      )}
      
      {/* 通用设置 */}
      <div className="general-settings mb-6">
        <h4 className="text-lg font-semibold mb-2">通用设置</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.general.autoPlayEnabled}
              onChange={(e) => handleGeneralSettingChange('autoPlayEnabled', e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span>自动播放</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.general.showKeyboard}
              onChange={(e) => handleGeneralSettingChange('showKeyboard', e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span>显示键盘</span>
          </label>
        </div>
        
        <h4 className="text-lg font-semibold mt-4 mb-2">键盘大小</h4>
        <div className="grid grid-cols-3 gap-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="keyboardSize"
              value="small"
              checked={settings.general.keyboardSize === 'small'}
              onChange={() => handleGeneralSettingChange('keyboardSize', 'small')}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span>小</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="keyboardSize"
              value="medium"
              checked={settings.general.keyboardSize === 'medium'}
              onChange={() => handleGeneralSettingChange('keyboardSize', 'medium')}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span>中</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="keyboardSize"
              value="large"
              checked={settings.general.keyboardSize === 'large'}
              onChange={() => handleGeneralSettingChange('keyboardSize', 'large')}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span>大</span>
          </label>
        </div>
      </div>
    </div>
  );
} 