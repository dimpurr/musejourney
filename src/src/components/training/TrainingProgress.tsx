'use client';

import { useState, useEffect } from 'react';
import { 
  getTrainingHistory, 
  TrainingType,
  TrainingHistoryItem
} from '@/lib/training/trainingStorage';

interface TrainingProgressProps {
  type: TrainingType;
  currentStats?: {
    total: number;
    correct: number;
    streak?: number;
  };
}

export default function TrainingProgress({ 
  type,
  currentStats
}: TrainingProgressProps) {
  const [stats, setStats] = useState({
    today: { total: 0, correct: 0 },
    week: { total: 0, correct: 0 },
    allTime: { total: 0, correct: 0 },
    byType: { total: 0, correct: 0 }
  });

  // 加载统计信息
  useEffect(() => {
    const loadStats = () => {
      try {
        const history = getTrainingHistory();
        
        // 获取当前日期
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
        
        // 按时间和类型过滤
        const todayItems = history.filter(item => item.timestamp >= today);
        const weekItems = history.filter(item => item.timestamp >= weekAgo);
        const typeItems = history.filter(item => item.type === type);
        
        // 计算统计信息
        const calculateStats = (items: TrainingHistoryItem[]) => {
          return {
            total: items.length,
            correct: items.filter(item => item.isCorrect).length
          };
        };
        
        setStats({
          today: calculateStats(todayItems),
          week: calculateStats(weekItems),
          allTime: calculateStats(history),
          byType: calculateStats(typeItems)
        });
      } catch (error) {
        console.error('Failed to load training stats:', error);
      }
    };
    
    loadStats();
    
    // 添加事件监听器，以便在其他组件更新历史记录时刷新
    window.addEventListener('training-history-updated', loadStats);
    
    return () => {
      window.removeEventListener('training-history-updated', loadStats);
    };
  }, [type]);

  // 计算正确率
  const calculateAccuracy = (total: number, correct: number) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  // 合并当前会话统计信息
  const mergedStats = {
    total: (currentStats?.total || 0) + stats.byType.total,
    correct: (currentStats?.correct || 0) + stats.byType.correct
  };

  return (
    <div className="training-progress bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold mb-4">训练进度</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* 当前会话 */}
        <div className="stat p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600">当前会话</div>
          <div className="text-xl font-bold">{currentStats?.total || 0}</div>
          <div className="text-sm">
            正确率: {calculateAccuracy(currentStats?.total || 0, currentStats?.correct || 0)}%
          </div>
          {currentStats?.streak !== undefined && (
            <div className="text-sm">
              连续正确: {currentStats.streak}
            </div>
          )}
        </div>
        
        {/* 今日 */}
        <div className="stat p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-600">今日</div>
          <div className="text-xl font-bold">{stats.today.total}</div>
          <div className="text-sm">
            正确率: {calculateAccuracy(stats.today.total, stats.today.correct)}%
          </div>
        </div>
        
        {/* 本周 */}
        <div className="stat p-3 bg-purple-50 rounded-lg">
          <div className="text-sm text-gray-600">本周</div>
          <div className="text-xl font-bold">{stats.week.total}</div>
          <div className="text-sm">
            正确率: {calculateAccuracy(stats.week.total, stats.week.correct)}%
          </div>
        </div>
        
        {/* 总计 */}
        <div className="stat p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">总计</div>
          <div className="text-xl font-bold">{stats.allTime.total}</div>
          <div className="text-sm">
            正确率: {calculateAccuracy(stats.allTime.total, stats.allTime.correct)}%
          </div>
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <div className="text-sm font-medium">总体进度</div>
          <div className="text-sm text-gray-600">
            {mergedStats.correct} / {mergedStats.total}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${calculateAccuracy(mergedStats.total, mergedStats.correct)}%` }}
          ></div>
        </div>
      </div>
      
      {/* 训练建议 */}
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold mb-2">训练建议</h4>
        {mergedStats.total < 10 ? (
          <p className="text-sm">继续练习以获取更多训练建议。</p>
        ) : calculateAccuracy(mergedStats.total, mergedStats.correct) < 60 ? (
          <p className="text-sm">考虑降低难度或专注于特定类型的训练。</p>
        ) : calculateAccuracy(mergedStats.total, mergedStats.correct) < 80 ? (
          <p className="text-sm">你正在进步！尝试增加训练频率以提高熟练度。</p>
        ) : (
          <p className="text-sm">表现出色！尝试增加难度或挑战新的训练类型。</p>
        )}
      </div>
    </div>
  );
} 