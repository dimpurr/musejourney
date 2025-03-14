'use client';

// 训练类型
export type TrainingType = 'interval' | 'chord' | 'progression';

// 训练难度
export type TrainingDifficulty = 'easy' | 'medium' | 'hard' | 'custom';

// 训练问题详情类型
export interface IntervalQuestionDetails {
  firstNote: string;
  secondNote: string;
  intervalName: string;
  intervalShortName: string;
  firstNoteMidi: number;
  secondNoteMidi: number;
}

export interface ChordQuestionDetails {
  root: string;
  rootMidi: number;
  type: string;
  typeName: string;
  midiNotes: number[];
  fullName: string;
}

export interface ProgressionQuestionDetails {
  name: string;
  description: string;
  chords: string[];
  romanNumerals: string[];
}

export type QuestionDetails = 
  | IntervalQuestionDetails 
  | ChordQuestionDetails 
  | ProgressionQuestionDetails;

// 训练记录项
export interface TrainingHistoryItem {
  id: string;
  type: TrainingType;
  question: string;
  answer: string;
  isCorrect: boolean;
  timestamp: number;
  details?: QuestionDetails; // 存储问题的详细信息，如音程/和弦/和声进行的具体内容
}

// 训练会话
export interface TrainingSession {
  id: string;
  type: TrainingType;
  timestamp: number;
  totalQuestions: number;
  correctAnswers: number;
  duration: number; // 以秒为单位
  settings: Partial<TrainingSettings>; // 训练设置
}

// 训练历史
export interface TrainingHistory {
  sessions: TrainingSession[];
  questions: TrainingHistoryItem[]; // 添加问题历史记录
}

// 音程训练设置
export interface IntervalTrainingSettings {
  selectedIntervals: string[];
  playbackMode: 'ascending' | 'descending' | 'harmonic' | 'random';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// 和弦训练设置
export interface ChordTrainingSettings {
  selectedChordTypes: string[];
  identifyRoot: boolean;
  identifyType: boolean;
  playbackMode: 'block' | 'arpeggio' | 'random';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// 和弦进行训练设置
export interface ProgressionTrainingSettings {
  selectedProgressions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// 通用设置
export interface GeneralSettings {
  autoPlayEnabled: boolean;
  showKeyboard: boolean;
  keyboardSize: 'small' | 'medium' | 'large';
}

// 所有训练设置
export interface TrainingSettings {
  interval: IntervalTrainingSettings;
  chord: ChordTrainingSettings;
  progression: ProgressionTrainingSettings;
  general: GeneralSettings;
}

// 默认音程训练设置
const DEFAULT_INTERVAL_SETTINGS: IntervalTrainingSettings = {
  selectedIntervals: ['m2', 'M2', 'm3', 'M3', 'P4', 'A4/d5', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'],
  playbackMode: 'ascending',
  difficulty: 'beginner'
};

// 默认和弦训练设置
const DEFAULT_CHORD_SETTINGS: ChordTrainingSettings = {
  selectedChordTypes: ['maj', 'min', 'aug', 'dim', 'maj7', '7', 'min7', 'm7b5', 'dim7'],
  identifyRoot: true,
  identifyType: true,
  playbackMode: 'block',
  difficulty: 'beginner'
};

// 默认和弦进行训练设置
const DEFAULT_PROGRESSION_SETTINGS: ProgressionTrainingSettings = {
  selectedProgressions: ['I-IV-V-I', 'I-V-vi-IV', 'ii-V-I', 'I-vi-IV-V', 'vi-IV-I-V'],
  difficulty: 'beginner'
};

// 默认通用设置
const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  autoPlayEnabled: true,
  showKeyboard: true,
  keyboardSize: 'medium'
};

// 默认训练设置
const DEFAULT_SETTINGS: TrainingSettings = {
  interval: DEFAULT_INTERVAL_SETTINGS,
  chord: DEFAULT_CHORD_SETTINGS,
  progression: DEFAULT_PROGRESSION_SETTINGS,
  general: DEFAULT_GENERAL_SETTINGS
};

// 默认训练历史
const DEFAULT_TRAINING_HISTORY: TrainingHistory = {
  sessions: [],
  questions: []
};

// 存储键
const HISTORY_STORAGE_KEY = 'musejourney_training_history';
const SETTINGS_STORAGE_KEY = 'musejourney_training_settings';

// 获取训练历史
export function getTrainingHistory(): TrainingHistory {
  if (typeof window === 'undefined') {
    return DEFAULT_TRAINING_HISTORY;
  }
  
  try {
    const historyJson = localStorage.getItem('trainingHistory');
    if (!historyJson) {
      return DEFAULT_TRAINING_HISTORY;
    }
    
    const history = JSON.parse(historyJson) as TrainingHistory;
    
    // 兼容旧版本数据
    if (!history.questions) {
      history.questions = [];
    }
    
    return history;
  } catch (error) {
    console.error('Failed to load training history:', error);
    return DEFAULT_TRAINING_HISTORY;
  }
}

// 保存训练历史
export function saveTrainingHistory(history: TrainingHistory): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save training history:', error);
  }
}

// 添加训练会话
export function addTrainingSession(session: TrainingSession): void {
  const history = getTrainingHistory();
  history.sessions.push(session);
  saveTrainingHistory(history);
}

// 清除训练历史
export function clearTrainingHistory(): void {
  saveTrainingHistory({ sessions: [], questions: [] });
}

// 获取训练设置
export function getTrainingSettings(): TrainingSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }
  
  try {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      // 合并存储的设置和默认设置，确保所有字段都存在
      return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
    }
  } catch (error) {
    console.error('Failed to load training settings:', error);
  }
  
  return DEFAULT_SETTINGS;
}

// 保存训练设置
export function saveTrainingSettings(settings: TrainingSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save training settings:', error);
  }
}

// 获取特定类型的训练设置
export function getTypeSettings<T extends keyof TrainingSettings>(type: T): TrainingSettings[T] {
  const settings = getTrainingSettings();
  return settings[type];
}

// 更新特定类型的训练设置
export function updateTypeSettings<T extends keyof TrainingSettings>(
  type: T, 
  newSettings: Partial<TrainingSettings[T]>
): void {
  const settings = getTrainingSettings();
  settings[type] = { ...settings[type], ...newSettings };
  saveTrainingSettings(settings);
}

// 获取训练统计数据
export function getTrainingStats(type?: TrainingType, timeRange?: { start: number; end: number }) {
  const history = getTrainingHistory();
  let filteredSessions = history.sessions;
  
  // 按类型筛选
  if (type) {
    filteredSessions = filteredSessions.filter(session => session.type === type);
  }
  
  // 按时间范围筛选
  if (timeRange) {
    filteredSessions = filteredSessions.filter(
      session => session.timestamp >= timeRange.start && session.timestamp <= timeRange.end
    );
  }
  
  // 计算统计数据
  const totalSessions = filteredSessions.length;
  const totalQuestions = filteredSessions.reduce((sum, session) => sum + session.totalQuestions, 0);
  const correctAnswers = filteredSessions.reduce((sum, session) => sum + session.correctAnswers, 0);
  const totalDuration = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
  
  return {
    totalSessions,
    totalQuestions,
    correctAnswers,
    accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
    totalDuration,
    averageSessionDuration: totalSessions > 0 ? totalDuration / totalSessions : 0
  };
}

// 获取今天的训练统计数据
export function getTodayStats(type?: TrainingType) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return getTrainingStats(type, {
    start: today.getTime(),
    end: Date.now()
  });
}

// 获取本周的训练统计数据
export function getWeekStats(type?: TrainingType) {
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  const day = today.getDay() || 7; // 将周日视为7
  firstDayOfWeek.setDate(today.getDate() - day + 1); // 设置为本周一
  firstDayOfWeek.setHours(0, 0, 0, 0);
  
  return getTrainingStats(type, {
    start: firstDayOfWeek.getTime(),
    end: Date.now()
  });
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// 添加训练问题记录
export function addTrainingQuestion(question: Omit<TrainingHistoryItem, 'id' | 'timestamp'>): string {
  const history = getTrainingHistory();
  const id = generateId();
  
  const newQuestion: TrainingHistoryItem = {
    ...question,
    id,
    timestamp: Date.now()
  };
  
  history.questions.unshift(newQuestion); // 添加到开头，最新的问题在前面
  
  // 限制保存的问题数量，最多保存100个
  if (history.questions.length > 100) {
    history.questions = history.questions.slice(0, 100);
  }
  
  saveTrainingHistory(history);
  return id;
}

// 获取最近的训练问题
export function getRecentQuestions(type: TrainingType, limit: number = 10): TrainingHistoryItem[] {
  const history = getTrainingHistory();
  return history.questions
    .filter(q => q.type === type)
    .slice(0, limit);
} 