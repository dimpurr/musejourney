'use client';

import { useState, useEffect } from 'react';
import ChordIdentifier from '@/components/training/ChordIdentifier';
import { initAudioEngine } from '@/lib/audio/audioEngine';

export default function ChordIdentifierPage() {
  const [audioReady, setAudioReady] = useState(false);
  
  // 初始化音频引擎
  useEffect(() => {
    const checkAudio = async () => {
      try {
        await initAudioEngine();
        setAudioReady(true);
      } catch (error) {
        console.error('Failed to initialize audio engine:', error);
      }
    };
    
    checkAudio();
  }, []);
  
  // 初始化音频引擎
  const handleInitAudio = async () => {
    try {
      await initAudioEngine();
      setAudioReady(true);
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">和弦听辨训练</h1>
      
      <div className="mb-8">
        <p className="text-lg mb-4">
          和弦听辨训练可以帮助您提高识别不同和弦类型的能力，这对于音乐分析、即兴演奏和作曲都非常重要。
        </p>
        
        {!audioReady ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-2">初始化音频引擎</h3>
            <p className="mb-4">
              为了能够播放和弦，您需要初始化音频引擎。这需要您的浏览器权限。
            </p>
            <button
              onClick={handleInitAudio}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              初始化音频引擎
            </button>
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-6">
            <p className="text-green-700">
              音频引擎已初始化，您可以开始训练。
            </p>
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">使用说明</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>点击"播放和弦"按钮，仔细聆听播放的和弦</li>
          <li>您可以选择听和弦或琶音</li>
          <li>根据您听到的和弦，从选项中选择正确的根音和和弦类型</li>
          <li>系统会立即给出反馈，并记录您的正确率</li>
          <li>点击"下一个"按钮继续练习</li>
        </ol>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {audioReady ? (
          <ChordIdentifier />
        ) : (
          <div className="p-8 text-center text-gray-500">
            请先初始化音频引擎以开始训练
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h2 className="text-xl font-bold mb-3">关于和弦训练</h2>
        <p className="mb-3">
          和弦是同时发声的三个或更多音符的组合，是音乐和声的基础。通过练习识别不同的和弦类型，您可以：
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>提高和声听辨能力</li>
          <li>更好地理解音乐作品的和声结构</li>
          <li>改善即兴演奏和伴奏能力</li>
          <li>增强作曲和编曲技巧</li>
          <li>提高音乐欣赏的深度</li>
        </ul>
        <p className="mt-3">
          建议从基本的三和弦（大三和弦、小三和弦）开始练习，然后逐渐过渡到更复杂的和弦类型（七和弦、扩展和弦等）。
        </p>
      </div>
    </div>
  );
} 