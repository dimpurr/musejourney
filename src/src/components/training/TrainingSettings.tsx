'use client';

import { useState, useEffect } from 'react';
import { 
  getTrainingSettings, 
  updateTrainingSettings, 
  resetTrainingSettings,
  TrainingType,
  TrainingSettings as TrainingSettingsType,
  TrainingDifficulty
} from '@/lib/training/trainingStorage';

// 音程数据
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

// 和弦类型数据
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

// 和声进行数据
const PROGRESSIONS = [
  { name: 'I-IV-V-I', description: '基础和声进行' },
  { name: 'I-V-vi-IV', description: '流行音乐进行' },
  { name: 'ii-V-I', description: '爵士和声进行' },
  { name: 'I-vi-IV-V', description: '50年代进行' },
  { name: 'vi-IV-I-V', description: '悲伤进行' },
  { name: 'I-V-vi-iii-IV-I-IV-V', description: '卡农进行' }
];

// 难度预设
const DIFFICULTY_PRESETS: Record<TrainingDifficulty, { label: string, description: string }> = {
  easy: { 
    label: '简单', 
    description: '基础音程、和弦和和声进行' 
  },
  medium: { 
    label: '中等', 
    description: '包含更多种类的音程、和弦和和声进行' 
  },
  hard: { 
    label: '困难', 
    description: '包含所有音程、和弦和和声进行' 
  },
  custom: { 
    label: '自定义', 
    description: '自定义训练内容' 
  }
};

interface TrainingSettingsProps {
  type: TrainingType;
  onSettingsChange?: (settings: TrainingSettingsType[TrainingType]) => void;
}

export default function TrainingSettings({ 
  type,
  onSettingsChange 
}: TrainingSettingsProps) {
  const [settings, setSettings] = useState<TrainingSettingsType[TrainingType] | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // 加载设置
  useEffect(() => {
    try {
      const allSettings = getTrainingSettings();
      setSettings(allSettings[type]);
    } catch (error) {
      console.error('Failed to load training settings:', error);
    }
  }, [type]);

  // 保存设置
  const saveSettings = (newSettings: Partial<TrainingSettingsType[TrainingType]>) => {
    try {
      const updatedSettings = updateTrainingSettings(type, newSettings);
      setSettings(updatedSettings[type]);
      
      // 触发事件通知其他组件设置已更新
      window.dispatchEvent(new Event('training-settings-updated'));
      
      // 调用回调
      if (onSettingsChange) {
        onSettingsChange(updatedSettings[type]);
      }
    } catch (error) {
      console.error('Failed to save training settings:', error);
    }
  };

  // 重置设置
  const handleResetSettings = () => {
    if (window.confirm('确定要重置所有训练设置吗？此操作不可撤销。')) {
      try {
        const defaultSettings = resetTrainingSettings();
        setSettings(defaultSettings[type]);
        
        // 触发事件通知其他组件设置已更新
        window.dispatchEvent(new Event('training-settings-updated'));
        
        // 调用回调
        if (onSettingsChange) {
          onSettingsChange(defaultSettings[type]);
        }
      } catch (error) {
        console.error('Failed to reset training settings:', error);
      }
    }
  };

  // 切换设置面板
  const toggleSettings = () => {
    setIsOpen(!isOpen);
  };

  // 更新难度
  const handleDifficultyChange = (difficulty: TrainingDifficulty) => {
    if (!settings) return;
    
    let newSettings: Partial<TrainingSettingsType[TrainingType]> = {
      difficulty
    };
    
    // 根据难度预设更新选项
    if (type === 'interval') {
      let selectedIntervals: string[] = [];
      
      if (difficulty === 'easy') {
        // 简单：只包含基本音程
        selectedIntervals = ['M2', 'M3', 'P4', 'P5', 'P8'];
      } else if (difficulty === 'medium') {
        // 中等：包含更多音程
        selectedIntervals = ['m2', 'M2', 'm3', 'M3', 'P4', 'P5', 'M6', 'P8'];
      } else if (difficulty === 'hard') {
        // 困难：包含所有音程
        selectedIntervals = INTERVALS.map(i => i.shortName);
      }
      
      if (difficulty !== 'custom') {
        newSettings = {
          ...newSettings,
          selectedIntervals
        };
      }
    } else if (type === 'chord') {
      let selectedChordTypes: string[] = [];
      
      if (difficulty === 'easy') {
        // 简单：只包含基本和弦
        selectedChordTypes = ['maj', 'min'];
      } else if (difficulty === 'medium') {
        // 中等：包含更多和弦
        selectedChordTypes = ['maj', 'min', 'dim', 'aug', '7'];
      } else if (difficulty === 'hard') {
        // 困难：包含所有和弦
        selectedChordTypes = CHORD_TYPES.map(c => c.shortName);
      }
      
      if (difficulty !== 'custom') {
        newSettings = {
          ...newSettings,
          selectedChordTypes
        };
      }
    } else if (type === 'progression') {
      let selectedProgressions: string[] = [];
      
      if (difficulty === 'easy') {
        // 简单：只包含基本和声进行
        selectedProgressions = ['I-IV-V-I', 'I-V-vi-IV'];
      } else if (difficulty === 'medium') {
        // 中等：包含更多和声进行
        selectedProgressions = ['I-IV-V-I', 'I-V-vi-IV', 'ii-V-I', 'I-vi-IV-V'];
      } else if (difficulty === 'hard') {
        // 困难：包含所有和声进行
        selectedProgressions = PROGRESSIONS.map(p => p.name);
      }
      
      if (difficulty !== 'custom') {
        newSettings = {
          ...newSettings,
          selectedProgressions
        };
      }
    }
    
    saveSettings(newSettings);
  };

  // 更新音程选择
  const handleIntervalChange = (shortName: string, checked: boolean) => {
    if (!settings || type !== 'interval') return;
    
    const intervalSettings = settings as TrainingSettingsType['interval'];
    const currentSelected = [...(intervalSettings.selectedIntervals || [])];
    
    if (checked && !currentSelected.includes(shortName)) {
      currentSelected.push(shortName);
    } else if (!checked && currentSelected.includes(shortName)) {
      const index = currentSelected.indexOf(shortName);
      currentSelected.splice(index, 1);
    }
    
    saveSettings({ 
      selectedIntervals: currentSelected,
      difficulty: 'custom' // 当手动选择时，切换到自定义难度
    } as Partial<TrainingSettingsType['interval']>);
  };

  // 更新和弦类型选择
  const handleChordTypeChange = (shortName: string, checked: boolean) => {
    if (!settings || type !== 'chord') return;
    
    const chordSettings = settings as TrainingSettingsType['chord'];
    const currentSelected = [...(chordSettings.selectedChordTypes || [])];
    
    if (checked && !currentSelected.includes(shortName)) {
      currentSelected.push(shortName);
    } else if (!checked && currentSelected.includes(shortName)) {
      const index = currentSelected.indexOf(shortName);
      currentSelected.splice(index, 1);
    }
    
    saveSettings({ 
      selectedChordTypes: currentSelected,
      difficulty: 'custom' // 当手动选择时，切换到自定义难度
    } as Partial<TrainingSettingsType['chord']>);
  };

  // 更新和声进行选择
  const handleProgressionChange = (name: string, checked: boolean) => {
    if (!settings || type !== 'progression') return;
    
    const progressionSettings = settings as TrainingSettingsType['progression'];
    const currentSelected = [...(progressionSettings.selectedProgressions || [])];
    
    if (checked && !currentSelected.includes(name)) {
      currentSelected.push(name);
    } else if (!checked && currentSelected.includes(name)) {
      const index = currentSelected.indexOf(name);
      currentSelected.splice(index, 1);
    }
    
    saveSettings({ 
      selectedProgressions: currentSelected,
      difficulty: 'custom' // 当手动选择时，切换到自定义难度
    } as Partial<TrainingSettingsType['progression']>);
  };

  // 更新播放模式
  const handlePlaybackModeChange = (mode: 'ascending' | 'descending' | 'harmonic' | 'random') => {
    if (!settings || type !== 'interval') return;
    
    saveSettings({ 
      playbackMode: mode 
    } as Partial<TrainingSettingsType['interval']>);
  };

  // 更新识别选项
  const handleIdentifyOptionChange = (option: 'root' | 'type', checked: boolean) => {
    if (!settings || type !== 'chord') return;
    
    if (option === 'root') {
      saveSettings({ 
        identifyRoot: checked 
      } as Partial<TrainingSettingsType['chord']>);
    } else if (option === 'type') {
      saveSettings({ 
        identifyType: checked 
      } as Partial<TrainingSettingsType['chord']>);
    }
  };

  if (!settings) {
    return (
      <div className="training-settings p-4 bg-white rounded-lg shadow">
        <div className="text-center text-gray-500">加载设置中...</div>
      </div>
    );
  }

  // 根据训练类型获取特定设置
  const getTypedSettings = () => {
    if (type === 'interval') {
      return settings as TrainingSettingsType['interval'];
    } else if (type === 'chord') {
      return settings as TrainingSettingsType['chord'];
    } else {
      return settings as TrainingSettingsType['progression'];
    }
  };

  const typedSettings = getTypedSettings();

  return (
    <div className="training-settings bg-white rounded-lg shadow">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={toggleSettings}
      >
        <h3 className="text-lg font-bold">训练设置</h3>
        <button className="text-blue-600">
          {isOpen ? '收起' : '展开'}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {/* 难度选择 */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-2">难度</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(DIFFICULTY_PRESETS).map(([key, { label, description }]) => (
                <button
                  key={key}
                  className={`p-2 border rounded-md ${
                    typedSettings.difficulty === key
                      ? 'bg-blue-100 border-blue-500'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                  onClick={() => handleDifficultyChange(key as TrainingDifficulty)}
                >
                  <div className="font-semibold">{label}</div>
                  <div className="text-xs text-gray-600">{description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 音程训练特定设置 */}
          {type === 'interval' && (
            <>
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-2">播放模式</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    className={`p-2 border rounded-md ${
                      (typedSettings as TrainingSettingsType['interval']).playbackMode === 'ascending'
                        ? 'bg-blue-100 border-blue-500'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => handlePlaybackModeChange('ascending')}
                  >
                    上行播放
                  </button>
                  <button
                    className={`p-2 border rounded-md ${
                      (typedSettings as TrainingSettingsType['interval']).playbackMode === 'descending'
                        ? 'bg-blue-100 border-blue-500'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => handlePlaybackModeChange('descending')}
                  >
                    下行播放
                  </button>
                  <button
                    className={`p-2 border rounded-md ${
                      (typedSettings as TrainingSettingsType['interval']).playbackMode === 'harmonic'
                        ? 'bg-blue-100 border-blue-500'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => handlePlaybackModeChange('harmonic')}
                  >
                    和声播放
                  </button>
                  <button
                    className={`p-2 border rounded-md ${
                      (typedSettings as TrainingSettingsType['interval']).playbackMode === 'random'
                        ? 'bg-blue-100 border-blue-500'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => handlePlaybackModeChange('random')}
                  >
                    随机播放
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-semibold mb-2">选择音程</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {INTERVALS.map(interval => (
                    <label
                      key={interval.shortName}
                      className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={(typedSettings as TrainingSettingsType['interval']).selectedIntervals.length === 0 || 
                                (typedSettings as TrainingSettingsType['interval']).selectedIntervals.includes(interval.shortName)}
                        onChange={(e) => handleIntervalChange(interval.shortName, e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span>
                        {interval.name} ({interval.shortName})
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  注：空选表示包含所有音程
                </p>
              </div>
            </>
          )}

          {/* 和弦训练特定设置 */}
          {type === 'chord' && (
            <>
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-2">识别选项</h4>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(typedSettings as TrainingSettingsType['chord']).identifyRoot}
                      onChange={(e) => handleIdentifyOptionChange('root', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span>识别根音</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(typedSettings as TrainingSettingsType['chord']).identifyType}
                      onChange={(e) => handleIdentifyOptionChange('type', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span>识别和弦类型</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  注：至少需要选择一项
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-semibold mb-2">选择和弦类型</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {CHORD_TYPES.map(chord => (
                    <label
                      key={chord.shortName}
                      className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={(typedSettings as TrainingSettingsType['chord']).selectedChordTypes.length === 0 || 
                                (typedSettings as TrainingSettingsType['chord']).selectedChordTypes.includes(chord.shortName)}
                        onChange={(e) => handleChordTypeChange(chord.shortName, e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span>
                        {chord.name} ({chord.shortName})
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  注：空选表示包含所有和弦类型
                </p>
              </div>
            </>
          )}

          {/* 和声进行训练特定设置 */}
          {type === 'progression' && (
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-2">选择和声进行</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PROGRESSIONS.map(progression => (
                  <label
                    key={progression.name}
                    className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={(typedSettings as TrainingSettingsType['progression']).selectedProgressions.length === 0 || 
                              (typedSettings as TrainingSettingsType['progression']).selectedProgressions.includes(progression.name)}
                      onChange={(e) => handleProgressionChange(progression.name, e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span>
                      <span className="font-semibold">{progression.name}</span>
                      <span className="text-sm text-gray-600 ml-2">({progression.description})</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                注：空选表示包含所有和声进行
              </p>
            </div>
          )}

          {/* 重置按钮 */}
          <div className="flex justify-end">
            <button
              onClick={handleResetSettings}
              className="px-4 py-2 text-red-600 hover:text-red-800"
            >
              重置所有设置
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 