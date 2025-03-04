'use client';

import { useState, useEffect } from 'react';
import HarmonyAnalyzer from '@/components/analysis/HarmonyAnalyzer';
import { initAudioEngine } from '@/lib/audio/audioEngine';

export default function HarmonyAnalyzerPage() {
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
      <h1 className="text-3xl font-bold mb-6">和声分析工具</h1>
      
      <div className="mb-8">
        <p className="text-lg mb-4">
          和声分析工具可以帮助您理解和弦进行的功能和关系，探索常见的和弦进行模式，并获取和弦进行建议。
        </p>
        
        {!audioReady ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-2">初始化音频引擎</h3>
            <p className="mb-4">
              为了能够播放和弦和音符，您需要初始化音频引擎。这需要您的浏览器权限。
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
              音频引擎已初始化，您可以播放和弦和音符。
            </p>
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">使用说明</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>选择或输入一个调性（如 C major, A minor）</li>
          <li>添加和弦（如 Cmaj7, Dm7, G7）到和弦进行中</li>
          <li>查看和弦功能分析和常见后续和弦建议</li>
          <li>点击播放按钮听取和弦进行</li>
          <li>点击建议的和弦进行将其添加到当前进行中</li>
        </ol>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <HarmonyAnalyzer />
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h2 className="text-xl font-bold mb-3">关于和声分析</h2>
        <p className="mb-3">
          和声分析是音乐理论的重要组成部分，它帮助我们理解和弦之间的关系和功能。通过分析和弦进行，我们可以：
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>理解音乐作品的和声结构</li>
          <li>创作符合特定风格的和声进行</li>
          <li>预测和弦进行的可能发展方向</li>
          <li>理解调性音乐中的张力和解决</li>
        </ul>
      </div>
    </div>
  );
} 