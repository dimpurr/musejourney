'use client';

import { useState } from 'react';
import Link from 'next/link';

// 课程数据
const courseModules = [
  {
    id: 'basic',
    title: '基础乐理',
    description: '学习音乐的基本元素，包括音符、音程、音阶和节奏。',
    lessons: [
      { id: 'notes', title: '音符与记谱法', status: 'coming-soon' },
      { id: 'intervals', title: '音程理论', status: 'coming-soon' },
      { id: 'scales', title: '音阶与调式', status: 'coming-soon' },
      { id: 'rhythm', title: '节奏与拍子', status: 'coming-soon' },
    ]
  },
  {
    id: 'harmony',
    title: '和声基础',
    description: '探索和弦构成、功能和声以及常见和声进行。',
    lessons: [
      { id: 'triads', title: '三和弦构成', status: 'coming-soon' },
      { id: 'progressions', title: '和弦连接', status: 'coming-soon' },
      { id: 'diatonic', title: '调式和声', status: 'coming-soon' },
      { id: 'cadences', title: '终止式', status: 'coming-soon' },
    ]
  },
  {
    id: 'advanced',
    title: '进阶和声',
    description: '学习七和弦、二次和声以及调性转换技术。',
    lessons: [
      { id: 'seventh-chords', title: '七和弦', status: 'coming-soon' },
      { id: 'secondary-dominants', title: '二次和声', status: 'coming-soon' },
      { id: 'modulation', title: '调性转换', status: 'coming-soon' },
      { id: 'extended-harmony', title: '扩展和声', status: 'coming-soon' },
    ]
  },
  {
    id: 'modern',
    title: '现代和声技术',
    description: '探索现代音乐中的和声技术，包括爵士和声和非功能和声。',
    lessons: [
      { id: 'jazz-harmony', title: '爵士和声', status: 'coming-soon' },
      { id: 'modal-harmony', title: '调式和声', status: 'coming-soon' },
      { id: 'non-functional', title: '非功能和声', status: 'coming-soon' },
      { id: 'contemporary', title: '当代和声技术', status: 'coming-soon' },
    ]
  }
];

export default function CoursesPage() {
  const [activeModule, setActiveModule] = useState('basic');

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">MuseJourney 课程</h1>
      
      {/* 模块选择器 */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {courseModules.map(module => (
          <button
            key={module.id}
            className={`px-4 py-2 rounded-full ${
              activeModule === module.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setActiveModule(module.id)}
          >
            {module.title}
          </button>
        ))}
      </div>
      
      {/* 当前模块内容 */}
      {courseModules.map(module => (
        module.id === activeModule && (
          <div key={module.id} className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-2">{module.title}</h2>
              <p className="text-gray-600 mb-4">{module.description}</p>
              
              {/* 课程列表 */}
              <div className="grid gap-4 mt-6">
                {module.lessons.map(lesson => (
                  <div 
                    key={lesson.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">{lesson.title}</h3>
                      {lesson.status === 'coming-soon' ? (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">即将推出</span>
                      ) : (
                        <Link 
                          href={`/courses/${module.id}/${lesson.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          开始学习 →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 学习路径建议 */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold mb-2">学习建议</h3>
              <p className="text-gray-700">
                建议按照课程列表的顺序学习，每个概念都建立在前面概念的基础上。
                完成每节课后，尝试使用工具页面的互动工具来巩固所学知识。
              </p>
            </div>
          </div>
        )
      ))}
      
      <div className="text-center mt-12 text-gray-500">
        <p>更多课程内容正在开发中，敬请期待！</p>
      </div>
    </main>
  );
} 