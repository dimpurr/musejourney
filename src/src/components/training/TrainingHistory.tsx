'use client';

import { useState, useEffect } from 'react';
import { 
  getTrainingHistory, 
  clearTrainingHistory, 
  TrainingSession, 
  TrainingType 
} from '@/lib/training/trainingStorage';

interface TrainingHistoryProps {
  type?: TrainingType;
  limit?: number;
  showClearButton?: boolean;
  className?: string;
}

export default function TrainingHistory({
  type,
  limit = 10,
  showClearButton = true,
  className = ''
}: TrainingHistoryProps) {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TrainingType | 'all'>('all');

  // 加载训练历史
  useEffect(() => {
    const history = getTrainingHistory();
    let filteredSessions = history.sessions;
    
    // 如果指定了类型，则按类型筛选
    if (type) {
      filteredSessions = filteredSessions.filter(session => session.type === type);
      setFilter(type);
    }
    
    // 按时间排序（最新的在前）
    filteredSessions.sort((a, b) => b.timestamp - a.timestamp);
    
    // 限制数量
    if (limit > 0) {
      filteredSessions = filteredSessions.slice(0, limit);
    }
    
    setSessions(filteredSessions);
    setLoading(false);
  }, [type, limit]);

  // 清除历史
  const handleClearHistory = () => {
    if (window.confirm('确定要清除所有训练历史记录吗？此操作无法撤销。')) {
      clearTrainingHistory();
      setSessions([]);
    }
  };

  // 筛选会话
  const filterSessions = (filterType: TrainingType | 'all') => {
    setFilter(filterType);
    const history = getTrainingHistory();
    let filteredSessions = history.sessions;
    
    if (filterType !== 'all') {
      filteredSessions = filteredSessions.filter(session => session.type === filterType);
    }
    
    // 按时间排序（最新的在前）
    filteredSessions.sort((a, b) => b.timestamp - a.timestamp);
    
    // 限制数量
    if (limit > 0) {
      filteredSessions = filteredSessions.slice(0, limit);
    }
    
    setSessions(filteredSessions);
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化持续时间
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}分${remainingSeconds}秒`;
  };

  // 获取训练类型名称
  const getTypeName = (type: TrainingType) => {
    switch (type) {
      case 'interval':
        return '音程训练';
      case 'chord':
        return '和弦训练';
      case 'progression':
        return '和弦进行训练';
      default:
        return '未知训练';
    }
  };

  // 计算准确率
  const calculateAccuracy = (session: TrainingSession) => {
    if (session.totalQuestions === 0) return 0;
    return Math.round((session.correctAnswers / session.totalQuestions) * 100);
  };

  if (loading) {
    return (
      <div className={`training-history p-4 ${className}`}>
        <div className="text-center text-gray-500">加载训练历史...</div>
      </div>
    );
  }

  return (
    <div className={`training-history p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">训练历史</h3>
        
        {/* 筛选器 */}
        {!type && (
          <div className="filter-buttons flex space-x-2">
            <button
              onClick={() => filterSessions('all')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => filterSessions('interval')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'interval' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              音程
            </button>
            <button
              onClick={() => filterSessions('chord')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'chord' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              和弦
            </button>
            <button
              onClick={() => filterSessions('progression')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'progression' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              和弦进行
            </button>
          </div>
        )}
        
        {/* 清除按钮 */}
        {showClearButton && (
          <button
            onClick={handleClearHistory}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            清除历史
          </button>
        )}
      </div>
      
      {sessions.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          暂无训练历史记录
        </div>
      ) : (
        <div className="sessions-list space-y-4">
          {sessions.map(session => (
            <div 
              key={session.id} 
              className="session-item p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{getTypeName(session.type)}</div>
                  <div className="text-sm text-gray-600">{formatDate(session.timestamp)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    准确率: {calculateAccuracy(session)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {session.correctAnswers}/{session.totalQuestions} 题
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                持续时间: {formatDuration(session.duration)}
              </div>
              
              {/* 进度条 */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${calculateAccuracy(session)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 