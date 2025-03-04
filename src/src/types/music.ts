/**
 * 音符类型定义
 */
export type NoteName = string; // 例如 "C4", "D#5" 等

/**
 * 音程类型定义
 */
export type Interval = string; // 例如 "P1", "M3", "P5" 等

/**
 * 和弦类型定义
 */
export interface Chord {
  symbol: string; // 和弦符号，例如 "Cmaj7"
  root: NoteName; // 根音
  type: string; // 和弦类型，例如 "major", "minor", "dominant7" 等
  notes: NoteName[]; // 和弦包含的音符
  intervals: Interval[]; // 和弦包含的音程
}

/**
 * 音阶类型定义
 */
export interface Scale {
  name: string; // 音阶名称，例如 "C major", "A minor" 等
  tonic: NoteName; // 主音
  type: string; // 音阶类型，例如 "major", "minor", "dorian" 等
  notes: NoteName[]; // 音阶包含的音符
  intervals: Interval[]; // 音阶包含的音程
}

/**
 * 调性类型定义
 */
export interface Key {
  name: string; // 调性名称，例如 "C major", "A minor" 等
  tonic: NoteName; // 主音
  type: string; // 调性类型，例如 "major", "minor" 等
  signature: number; // 调号，正数表示升号数量，负数表示降号数量
}

/**
 * MIDI 音符事件类型定义
 */
export interface MidiNote {
  note: NoteName; // 音符名称
  midi: number; // MIDI 音符编号 (0-127)
  velocity: number; // 力度 (0-1)
  duration?: number; // 持续时间（秒）
  time?: number; // 开始时间（秒）
}

/**
 * 和声进行类型定义
 */
export interface ChordProgression {
  name?: string; // 进行名称，例如 "2-5-1"
  chords: Chord[]; // 和弦序列
  key?: Key; // 调性
}

/**
 * 练习内容类型定义
 */
export type ExerciseContent = 
  | ChordExerciseContent
  | ScaleExerciseContent
  | IntervalExerciseContent
  | ProgressionExerciseContent
  | EarTrainingExerciseContent;

/**
 * 和弦练习内容
 */
export interface ChordExerciseContent {
  chords: Chord[];
  instructions: string;
}

/**
 * 音阶练习内容
 */
export interface ScaleExerciseContent {
  scales: Scale[];
  instructions: string;
}

/**
 * 音程练习内容
 */
export interface IntervalExerciseContent {
  intervals: Interval[];
  notes: NoteName[][];
  instructions: string;
}

/**
 * 和声进行练习内容
 */
export interface ProgressionExerciseContent {
  progressions: ChordProgression[];
  instructions: string;
}

/**
 * 听力训练练习内容
 */
export interface EarTrainingExerciseContent {
  type: 'chord' | 'interval' | 'progression';
  examples: Array<Chord | Interval | ChordProgression>;
  instructions: string;
}

/**
 * 练习类型定义
 */
export interface Exercise {
  id: string;
  type: 'chord' | 'scale' | 'interval' | 'progression' | 'ear-training';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  content: ExerciseContent; // 具体练习内容，根据类型不同而不同
}

/**
 * 课程类型定义
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  modules: CourseModule[];
}

/**
 * 课程模块类型定义
 */
export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

/**
 * 课程课时类型定义
 */
export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string; // 可以是 Markdown 或 HTML
  exercises: Exercise[];
} 