'use client';

import { useRef, useEffect } from 'react';
import { Vex } from 'vexflow';

// 定义乐谱显示组件的属性
interface MusicNotationProps {
  notes: string[]; // 音符数组，如 ["C4/q", "D4/q", "E4/q", "F4/q"]
  clef?: 'treble' | 'bass' | 'alto' | 'tenor'; // 谱号
  timeSignature?: string; // 拍号，如 "4/4", "3/4"
  keySignature?: string; // 调号，如 "C", "G", "F"
  width?: number; // 宽度
  height?: number; // 高度
}

export default function MusicNotation({
  notes,
  clef = 'treble',
  timeSignature = '4/4',
  keySignature = 'C',
  width = 500,
  height = 150
}: MusicNotationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 清空容器
    containerRef.current.innerHTML = '';
    
    try {
      // 创建 VexFlow 渲染器
      const VF = Vex.Flow;
      
      // 创建渲染器
      const renderer = new VF.Renderer(
        containerRef.current,
        VF.Renderer.Backends.SVG
      );
      
      // 配置渲染器
      renderer.resize(width, height);
      const context = renderer.getContext();
      
      // 将音符分组为小节
      const measuresNotes = groupNotesIntoMeasures(notes, timeSignature);
      
      // 计算小节数量和每个小节的宽度
      const measureCount = measuresNotes.length;
      const staveWidth = (width - 40) / Math.min(measureCount, 4);
      const stavesPerLine = Math.min(measureCount, 4);
      
      // 创建小节
      let currentLine = 0;
      let currentStaveInLine = 0;
      
      measuresNotes.forEach((measureNotes) => {
        // 计算小节位置
        if (currentStaveInLine >= stavesPerLine) {
          currentLine++;
          currentStaveInLine = 0;
        }
        
        const xPos = 20 + currentStaveInLine * staveWidth;
        const yPos = 40 + currentLine * 100;
        
        // 创建五线谱
        const stave = new VF.Stave(xPos, yPos, staveWidth);
        
        // 只在每行的第一个小节添加谱号、调号和拍号
        if (currentStaveInLine === 0) {
          stave.addClef(clef);
          stave.addKeySignature(keySignature);
          stave.addTimeSignature(timeSignature);
        }
        
        stave.setContext(context).draw();
        
        // 创建音符
        const vfNotes = [];
        for (const noteStr of measureNotes) {
          const [pitch, duration = 'q'] = noteStr.split('/');
          vfNotes.push(new VF.StaveNote({ clef, keys: [pitch], duration }));
        }
        
        // 创建声部
        const voice = new VF.Voice({ num_beats: parseInt(timeSignature.split('/')[0], 10), beat_value: parseInt(timeSignature.split('/')[1], 10) });
        voice.addTickables(vfNotes);
        
        // 创建格式化器
        const formatter = new VF.Formatter();
        formatter.joinVoices([voice]).format([voice], staveWidth - 50);
        
        // 绘制音符
        voice.draw(context, stave);
        
        currentStaveInLine++;
      });
      
    } catch (error) {
      console.error('Error rendering music notation:', error);
      
      // 显示错误信息
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div style="color: red; padding: 10px;">
            无法渲染乐谱: ${error instanceof Error ? error.message : String(error)}
          </div>
        `;
      }
    }
  }, [notes, clef, timeSignature, keySignature, width, height]);
  
  // 将音符分组为小节
  const groupNotesIntoMeasures = (notes: string[], timeSignature: string): string[][] => {
    // 解析拍号
    const [beatsPerMeasure, beatValue] = timeSignature.split('/').map(Number);
    
    // 计算每个小节的总时值
    const measureDuration = beatsPerMeasure * (4 / beatValue);
    
    const measures: string[][] = [];
    let currentMeasure: string[] = [];
    let currentDuration = 0;
    
    notes.forEach(note => {
      // 解析音符时值
      const durationStr = note.split('/')[1] || 'q';
      let duration = 1; // 默认为四分音符
      
      // 计算时值
      switch (durationStr) {
        case 'w': duration = 4; break; // 全音符
        case 'h': duration = 2; break; // 二分音符
        case 'q': duration = 1; break; // 四分音符
        case '8': duration = 0.5; break; // 八分音符
        case '16': duration = 0.25; break; // 十六分音符
        case '32': duration = 0.125; break; // 三十二分音符
        default: duration = 1;
      }
      
      // 如果当前小节已满，创建新的小节
      if (currentDuration + duration > measureDuration) {
        measures.push([...currentMeasure]);
        currentMeasure = [];
        currentDuration = 0;
      }
      
      // 添加音符到当前小节
      currentMeasure.push(note);
      currentDuration += duration;
    });
    
    // 添加最后一个小节
    if (currentMeasure.length > 0) {
      measures.push(currentMeasure);
    }
    
    return measures;
  };
  
  return (
    <div className="music-notation">
      <div 
        ref={containerRef}
        className="notation-container"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
} 