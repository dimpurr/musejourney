import * as Tonal from '@tonaljs/tonal';
import { Chord, Scale, Key, NoteName, Interval, ChordProgression } from '@/types/music';

/**
 * 获取和弦信息
 */
export function getChordInfo(chordName: string): Chord | null {
  try {
    const chord = Tonal.Chord.get(chordName);
    
    if (!chord.empty) {
      return {
        symbol: chord.symbol,
        root: chord.tonic as NoteName,
        type: chord.type,
        notes: chord.notes as NoteName[],
        intervals: chord.intervals as Interval[],
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting chord info:', error);
    return null;
  }
}

/**
 * 获取音阶信息
 */
export function getScaleInfo(scaleName: string): Scale | null {
  try {
    const [tonic, type] = Tonal.Scale.tokenize(scaleName);
    
    if (!tonic || !type) {
      return null;
    }
    
    const scale = Tonal.Scale.get(scaleName);
    
    if (scale.empty) {
      return null;
    }
    
    return {
      name: scaleName,
      tonic: tonic as NoteName,
      type: type,
      notes: scale.notes as NoteName[],
      intervals: scale.intervals as Interval[],
    };
  } catch (error) {
    console.error('Error getting scale info:', error);
    return null;
  }
}

/**
 * 获取调性信息
 */
export function getKeyInfo(keyName: string): Key | null {
  try {
    // 手动解析调性名称
    const parts = keyName.split(' ');
    const tonic = parts[0];
    const type = parts.length > 1 ? parts[1] : 'major';
    
    if (!tonic) {
      return null;
    }
    
    // 根据调性类型获取调号
    let signature = 0;
    if (type.toLowerCase() === 'major') {
      const key = Tonal.Key.majorKey(tonic);
      signature = key.keySignature.indexOf('#') > -1 ? key.keySignature.length : -key.keySignature.length;
    } else if (type.toLowerCase() === 'minor') {
      const key = Tonal.Key.minorKey(tonic);
      signature = key.keySignature.indexOf('#') > -1 ? key.keySignature.length : -key.keySignature.length;
    }
    
    return {
      name: keyName,
      tonic: tonic as NoteName,
      type: type,
      signature: signature,
    };
  } catch (error) {
    console.error('Error getting key info:', error);
    return null;
  }
}

/**
 * 获取音程信息
 */
export function getIntervalInfo(interval: string): Interval | null {
  try {
    const parsed = Tonal.Interval.get(interval);
    
    if (parsed.empty) {
      return null;
    }
    
    return parsed.name as Interval;
  } catch (error) {
    console.error('Error getting interval info:', error);
    return null;
  }
}

/**
 * 获取音符之间的音程
 */
export function getIntervalBetweenNotes(noteA: string, noteB: string): Interval | null {
  try {
    const interval = Tonal.distance(noteA, noteB);
    return interval as Interval;
  } catch (error) {
    console.error('Error calculating interval between notes:', error);
    return null;
  }
}

/**
 * 转位和弦
 */
export function invertChord(chordName: string, inversion: number): string[] | null {
  try {
    const chord = getChordInfo(chordName);
    
    if (!chord) {
      return null;
    }
    
    const notes = [...chord.notes];
    
    // 执行转位
    for (let i = 0; i < inversion; i++) {
      const firstNote = notes.shift();
      if (firstNote) {
        // 将第一个音符移到最后，并升高一个八度
        const octave = parseInt(firstNote.slice(-1)) + 1;
        const noteName = firstNote.slice(0, -1);
        notes.push(`${noteName}${octave}`);
      }
    }
    
    return notes;
  } catch (error) {
    console.error('Error inverting chord:', error);
    return null;
  }
}

/**
 * 获取和弦在调性中的功能
 */
export function getChordFunction(chordName: string, keyName: string): string | null {
  try {
    const chord = getChordInfo(chordName);
    const key = getKeyInfo(keyName);
    
    if (!chord || !key) {
      return null;
    }
    
    // 获取和弦根音在调性中的音级
    const chordRoot = chord.root.slice(0, -1); // 移除八度信息
    const keyTonic = key.tonic.slice(0, -1); // 移除八度信息
    
    const degree = Tonal.transpose(keyTonic, Tonal.distance(keyTonic, chordRoot));
    
    // 获取音阶音级
    const scaleType = key.type === 'major' ? 'major' : 'minor';
    const scale = Tonal.Scale.get(`${key.tonic} ${scaleType}`);
    const scaleNotes = scale.notes.map(note => note.slice(0, -1)); // 移除八度信息
    
    const degreeIndex = scaleNotes.indexOf(degree);
    
    // 罗马数字表示
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const chordType = chord.type;
    
    // 大写表示大和弦，小写表示小和弦
    let roman = romanNumerals[degreeIndex];
    if (chordType.includes('minor') || chordType.includes('diminished')) {
      roman = roman.toLowerCase();
    }
    
    // 添加和弦类型标记
    if (chordType.includes('diminished')) {
      roman += '°';
    } else if (chordType.includes('augmented')) {
      roman += '+';
    } else if (chordType.includes('7')) {
      roman += '7';
    }
    
    return roman;
  } catch (error) {
    console.error('Error getting chord function:', error);
    return null;
  }
}

/**
 * 获取常见和弦进行
 */
export function getCommonProgressions(keyName: string): Record<string, ChordProgression>;
export function getCommonProgressions(chordName: string, keyName: string): string[][];
export function getCommonProgressions(arg1: string, arg2?: string): Record<string, ChordProgression> | string[][] {
  // 如果只有一个参数，返回调性中的常见和弦进行
  if (!arg2) {
    try {
      const keyName = arg1;
      const key = getKeyInfo(keyName);
      
      if (!key) {
        return {};
      }
      
      const scale = getScaleInfo(`${key.tonic} ${key.type}`);
      
      if (!scale) {
        return {};
      }
      
      // 获取调内和弦
      let chordsInKey: Array<string> = [];
      if (key.type.toLowerCase() === 'major') {
        const majorKey = Tonal.Key.majorKey(key.tonic);
        chordsInKey = [...majorKey.chords];
      } else if (key.type.toLowerCase() === 'minor') {
        const minorKey = Tonal.Key.minorKey(key.tonic);
        chordsInKey = [...minorKey.harmonic.chords];
      }
      
      // 常见和弦进行
      const progressions: Record<string, ChordProgression> = {
        'I-IV-V': {
          name: 'I-IV-V',
          chords: [
            getChordInfo(chordsInKey[0]) as Chord,
            getChordInfo(chordsInKey[3]) as Chord,
            getChordInfo(chordsInKey[4]) as Chord,
          ],
          key: key,
        },
        'I-V-vi-IV': {
          name: 'I-V-vi-IV (流行进行)',
          chords: [
            getChordInfo(chordsInKey[0]) as Chord,
            getChordInfo(chordsInKey[4]) as Chord,
            getChordInfo(chordsInKey[5]) as Chord,
            getChordInfo(chordsInKey[3]) as Chord,
          ],
          key: key,
        },
        'ii-V-I': {
          name: 'ii-V-I (爵士进行)',
          chords: [
            getChordInfo(chordsInKey[1]) as Chord,
            getChordInfo(chordsInKey[4]) as Chord,
            getChordInfo(chordsInKey[0]) as Chord,
          ],
          key: key,
        },
        'I-vi-IV-V': {
          name: 'I-vi-IV-V (50年代进行)',
          chords: [
            getChordInfo(chordsInKey[0]) as Chord,
            getChordInfo(chordsInKey[5]) as Chord,
            getChordInfo(chordsInKey[3]) as Chord,
            getChordInfo(chordsInKey[4]) as Chord,
          ],
          key: key,
        },
        'vi-IV-I-V': {
          name: 'vi-IV-I-V (悲伤进行)',
          chords: [
            getChordInfo(chordsInKey[5]) as Chord,
            getChordInfo(chordsInKey[3]) as Chord,
            getChordInfo(chordsInKey[0]) as Chord,
            getChordInfo(chordsInKey[4]) as Chord,
          ],
          key: key,
        },
      };
      
      return progressions;
    } catch (error) {
      console.error('Error getting common progressions:', error);
      return {};
    }
  } 
  // 如果有两个参数，根据当前和弦和调性返回后续和弦建议
  else {
    try {
      const chordName = arg1;
      const keyName = arg2;
      
      // 获取和弦功能
      const chordFunction = getChordFunction(chordName, keyName);
      if (!chordFunction) {
        return [];
      }
      
      // 根据和弦功能提供后续和弦建议
      const suggestions: string[][] = [];
      
      // 获取调内和弦
      const key = getKeyInfo(keyName);
      if (!key) {
        return [];
      }
      
      let chordsInKey: Array<string> = [];
      if (key.type.toLowerCase() === 'major') {
        const majorKey = Tonal.Key.majorKey(key.tonic);
        chordsInKey = [...majorKey.chords];
      } else if (key.type.toLowerCase() === 'minor') {
        const minorKey = Tonal.Key.minorKey(key.tonic);
        chordsInKey = [...minorKey.harmonic.chords];
      }
      
      // 根据当前和弦功能提供常见后续和弦
      switch (chordFunction.toLowerCase()) {
        case 'i':
        case 'i7':
          suggestions.push([chordsInKey[3]]); // I -> IV
          suggestions.push([chordsInKey[4]]); // I -> V
          suggestions.push([chordsInKey[5]]); // I -> vi
          suggestions.push([chordsInKey[1], chordsInKey[4]]); // I -> ii -> V
          break;
        case 'ii':
        case 'ii7':
          suggestions.push([chordsInKey[4]]); // ii -> V
          suggestions.push([chordsInKey[4], chordsInKey[0]]); // ii -> V -> I
          break;
        case 'iii':
        case 'iii7':
          suggestions.push([chordsInKey[5]]); // iii -> vi
          suggestions.push([chordsInKey[1]]); // iii -> ii
          break;
        case 'iv':
        case 'iv7':
          suggestions.push([chordsInKey[0]]); // IV -> I
          suggestions.push([chordsInKey[4]]); // IV -> V
          suggestions.push([chordsInKey[4], chordsInKey[0]]); // IV -> V -> I
          break;
        case 'v':
        case 'v7':
          suggestions.push([chordsInKey[0]]); // V -> I
          suggestions.push([chordsInKey[5]]); // V -> vi
          suggestions.push([chordsInKey[3]]); // V -> IV
          break;
        case 'vi':
        case 'vi7':
          suggestions.push([chordsInKey[1]]); // vi -> ii
          suggestions.push([chordsInKey[3]]); // vi -> IV
          suggestions.push([chordsInKey[3], chordsInKey[0]]); // vi -> IV -> I
          break;
        case 'vii°':
        case 'vii°7':
          suggestions.push([chordsInKey[0]]); // vii° -> I
          suggestions.push([chordsInKey[5]]); // vii° -> vi
          break;
        default:
          // 如果无法确定和弦功能，提供一些通用建议
          suggestions.push([chordsInKey[0]]); // -> I
          suggestions.push([chordsInKey[4]]); // -> V
          suggestions.push([chordsInKey[3]]); // -> IV
      }
      
      return suggestions;
    } catch (error) {
      console.error('Error getting chord suggestions:', error);
      return [];
    }
  }
}

/**
 * 获取和弦音符的音高类别
 */
export function getChordNotePitchClasses(chordName: string): string[] {
  try {
    const chord = getChordInfo(chordName);
    
    if (!chord) {
      return [];
    }
    
    // 移除八度信息，只保留音高类别
    return chord.notes.map(note => note.slice(0, -1));
  } catch (error) {
    console.error('Error getting chord note pitch classes:', error);
    return [];
  }
}

/**
 * 判断音符是否属于和弦
 */
export function isNoteInChord(note: string, chordName: string): boolean {
  try {
    const pitchClass = note.slice(0, -1); // 移除八度信息
    const chordPitchClasses = getChordNotePitchClasses(chordName);
    
    return chordPitchClasses.includes(pitchClass);
  } catch (error) {
    console.error('Error checking if note is in chord:', error);
    return false;
  }
}

/**
 * 判断音符是否属于音阶
 */
export function isNoteInScale(note: string, scaleName: string): boolean {
  try {
    const pitchClass = note.slice(0, -1); // 移除八度信息
    const scale = getScaleInfo(scaleName);
    
    if (!scale) {
      return false;
    }
    
    // 移除八度信息，只保留音高类别
    const scalePitchClasses = scale.notes.map(n => n.slice(0, -1));
    
    return scalePitchClasses.includes(pitchClass);
  } catch (error) {
    console.error('Error checking if note is in scale:', error);
    return false;
  }
} 