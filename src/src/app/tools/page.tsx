'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { initAudioEngine } from '@/lib/audio/audioEngine';

// 工具数据
const toolCategories = [
  {
    id: 'analysis',
    title: '和声分析工具',
    description: '分析和弦、和声进行和调性关系的工具。',
    tools: [
      { 
        id: 'chord-identifier', 
        title: '和弦识别器', 
        description: '输入音符或使用钢琴键盘来识别和弦。',
        status: 'coming-soon',
        icon: '🎹'
      },
      { 
        id: 'progression-analyzer', 
        title: '和声进行分析器', 
        description: '分析和声进行的功能和常见用法。',
        status: 'coming-soon',
        icon: '📊'
      },
      { 
        id: 'key-analyzer', 
        title: '调性分析器', 
        description: '确定一段音乐的调性和可能的调性转换。',
        status: 'coming-soon',
        icon: '🔑'
      }
    ]
  },
  {
    id: 'composition',
    title: '创作辅助工具',
    description: '帮助音乐创作的工具和资源。',
    tools: [
      { 
        id: 'progression-generator', 
        title: '和声进行生成器', 
        description: '生成常见和独特的和声进行。',
        status: 'coming-soon',
        icon: '✨'
      },
      { 
        id: 'chord-variations', 
        title: '和弦变奏工具', 
        description: '探索和弦的不同变奏和替代和弦。',
        status: 'coming-soon',
        icon: '🔄'
      },
      { 
        id: 'harmony-templates', 
        title: '和声模板库', 
        description: '各种音乐风格的和声模板集合。',
        status: 'coming-soon',
        icon: '📚'
      }
    ]
  },
  {
    id: 'ear-training',
    title: '听力训练工具',
    description: '提高音乐听力和识别能力的练习工具。',
    tools: [
      { 
        id: 'interval-trainer', 
        title: '音程听辨训练', 
        description: '练习识别不同的音程。',
        status: 'coming-soon',
        icon: '👂'
      },
      { 
        id: 'chord-ear-training', 
        title: '和弦听辨训练', 
        description: '练习识别不同类型的和弦。',
        status: 'coming-soon',
        icon: '🎧'
      },
      { 
        id: 'progression-ear-training', 
        title: '和声进行听辨训练', 
        description: '练习识别常见的和声进行。',
        status: 'coming-soon',
        icon: '🔊'
      }
    ]
  }
];

export default function ToolsPage() {
  const [audioInitialized, setAudioInitialized] = useState(false);

  useEffect(() => {
    // 检查音频引擎是否已初始化
    const checkAudioInit = async () => {
      try {
        const result = await initAudioEngine();
        setAudioInitialized(result);
      } catch (error) {
        console.error('Failed to initialize audio engine:', error);
      }
    };
    
    checkAudioInit();
  }, []);

  const handleInitAudio = async () => {
    try {
      const result = await initAudioEngine();
      setAudioInitialized(result);
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">MuseJourney 工具</h1>
      
      {/* 音频初始化提示 */}
      {!audioInitialized && (
        <div className="max-w-md mx-auto mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 mb-2">
            使用音频功能需要初始化音频引擎
          </p>
          <button
            onClick={handleInitAudio}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            初始化音频引擎
          </button>
        </div>
      )}
      
      {/* 工具分类 */}
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        {toolCategories.map(category => (
          <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{category.title}</h2>
              <p className="text-gray-600 mb-4">{category.description}</p>
              
              {/* 工具列表 */}
              <div className="space-y-4 mt-6">
                {category.tools.map(tool => (
                  <div 
                    key={tool.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="text-3xl mr-4">{tool.icon}</div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium">{tool.title}</h3>
                          {tool.status === 'coming-soon' && (
                            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">即将推出</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{tool.description}</p>
                        
                        {tool.status !== 'coming-soon' ? (
                          <Link 
                            href={`/tools/${tool.id}`}
                            className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            打开工具 →
                          </Link>
                        ) : (
                          <p className="text-gray-400 text-sm mt-2">开发中...</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-12 text-gray-500">
        <p>更多工具正在开发中，敬请期待！</p>
        <p className="mt-2">
          有工具建议？请
          <Link href="/about" className="text-blue-600 hover:text-blue-800 mx-1">
            联系我们
          </Link>
          提出您的想法。
        </p>
      </div>
    </main>
  );
} 