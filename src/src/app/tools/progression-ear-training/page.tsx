'use client';

import { useState, useEffect } from 'react';
import ProgressionTrainer from '@/components/training/ProgressionTrainer';
import { initAudioEngine } from '@/lib/audio/audioEngine';

export default function ProgressionEarTrainingPage() {
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
      <h1 className="text-3xl font-bold mb-6">和声进行听辨训练</h1>
      
      <div className="mb-8">
        <p className="text-lg mb-4">
          和声进行听辨训练可以帮助您提高识别常见和声进行的能力，这对于音乐分析、即兴演奏和作曲都非常重要。
        </p>
        
        {!audioReady ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-2">初始化音频引擎</h3>
            <p className="mb-4">
              为了能够播放和声进行，您需要初始化音频引擎。这需要您的浏览器权限。
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
          <li>点击&quot;播放和声进行&quot;按钮，仔细聆听播放的和声进行</li>
          <li>观察钢琴键盘上的音符变化，帮助您理解和声进行</li>
          <li>从选项中选择您认为正确的和声进行名称</li>
          <li>系统会立即给出反馈，并显示正确的和声进行信息</li>
          <li>点击&quot;下一个&quot;按钮继续练习</li>
        </ol>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {audioReady ? (
          <ProgressionTrainer />
        ) : (
          <div className="p-8 text-center text-gray-500">
            请先初始化音频引擎以开始训练
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h2 className="text-xl font-bold mb-3">关于和声进行训练</h2>
        <p className="mb-3">
          和声进行是一系列和弦的连接，它们构成了音乐的和声框架。通过练习识别常见的和声进行，您可以：
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>提高音乐分析能力</li>
          <li>更好地理解音乐作品的结构</li>
          <li>改善即兴演奏和伴奏能力</li>
          <li>增强作曲和编曲技巧</li>
          <li>提高音乐记忆力</li>
        </ul>
        <p className="mt-3">
          建议从基本的和声进行（如I-IV-V-I）开始练习，然后逐渐过渡到更复杂的和声进行。将和声进行与熟悉的歌曲联系起来，可以帮助您更好地记忆和识别它们。
        </p>
      </div>
    </div>
  );
} 