'use client';

import { useEffect, useState } from 'react';
import { initAudioEngine } from '@/lib/audio/audioEngine';

export default function Home() {
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  useEffect(() => {
    const initAudio = async () => {
      const initialized = await initAudioEngine();
      setAudioInitialized(initialized);
    };
    
    initAudio();
  }, []);
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">MuseJourney - 交互式乐理教程</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">欢迎来到 MuseJourney</h2>
          
          <p className="mb-4">
            MuseJourney 是一个专注于和声学等音乐理论知识的交互式乐理教程平台。
            通过网页 MIDI 技术，提供直观、可视化的音乐理论学习体验。
          </p>
          
          {!audioInitialized ? (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={async () => {
                const initialized = await initAudioEngine();
                setAudioInitialized(initialized);
              }}
            >
              初始化音频引擎
            </button>
          ) : (
            <div className="text-green-600 font-semibold">
              音频引擎已初始化，可以开始学习了！
            </div>
          )}
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-xl font-semibold mb-2">基础乐理</h3>
              <p>学习音符、音程、音阶和和弦的基础知识。</p>
              <button className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                开始学习
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-xl font-semibold mb-2">和声学</h3>
              <p>探索和弦进行、调式和声和功能和声。</p>
              <button className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                开始学习
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-xl font-semibold mb-2">听力训练</h3>
              <p>训练识别音程、和弦和和声进行的能力。</p>
              <button className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                开始训练
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-xl font-semibold mb-2">创作工具</h3>
              <p>使用和声工具辅助音乐创作。</p>
              <button className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                开始创作
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-500">
          <p>MuseJourney 目前处于开发阶段，更多功能即将推出。</p>
        </div>
      </div>
    </main>
  );
}
