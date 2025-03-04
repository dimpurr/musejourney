'use client';

import { useState, useEffect } from 'react';
import { 
  getTrainingHistory, 
  getTodayStats, 
  getWeekStats, 
  TrainingType 
} from '@/lib/training/trainingStorage';

interface TrainingProgressProps {
  type: TrainingType;
  currentStats?: {
    totalQuestions: number;
    correctAnswers: number;
  };
}

export default function TrainingProgress({
  type,
  currentStats
}: TrainingProgressProps) {
  const [stats, setStats] = useState({
    today: { totalQuestions: 0, correctAnswers: 0, accuracy: 0 },
    week: { totalQuestions: 0, correctAnswers: 0, accuracy: 0 },
    allTime: { totalQuestions: 0, correctAnswers: 0, accuracy: 0 },
    typeSpecific: { totalQuestions: 0, correctAnswers: 0, accuracy: 0 }
  });

  // 加载统计数据
  useEffect(() => {
    // 获取今天的统计数据
    const todayStats = getTodayStats(type);
    
    // 获取本周的统计数据
    const weekStats = getWeekStats(type);
    
    // 获取所有时间的统计数据
    const history = getTrainingHistory();
    const allTimeSessions = history.sessions;
    
    // 按类型筛选
    const typeSpecificSessions = allTimeSessions.filter(session => session.type === type);
    
    // 计算所有时间的统计数据
    const allTimeTotal = allTimeSessions.reduce((sum, session) => sum + session.totalQuestions, 0);
    const allTimeCorrect = allTimeSessions.reduce((sum, session) => sum + session.correctAnswers, 0);
    
    // 计算特定类型的统计数据
    const typeSpecificTotal = typeSpecificSessions.reduce((sum, session) => sum + session.totalQuestions, 0);
    const typeSpecificCorrect = typeSpecificSessions.reduce((sum, session) => sum + session.correctAnswers, 0);
    
    // 更新统计数据
    setStats({
      today: {
        totalQuestions: todayStats.totalQuestions,
        correctAnswers: todayStats.correctAnswers,
        accuracy: calculateAccuracy(todayStats.correctAnswers, todayStats.totalQuestions)
      },
      week: {
        totalQuestions: weekStats.totalQuestions,
        correctAnswers: weekStats.correctAnswers,
        accuracy: calculateAccuracy(weekStats.correctAnswers, weekStats.totalQuestions)
      },
      allTime: {
        totalQuestions: allTimeTotal,
        correctAnswers: allTimeCorrect,
        accuracy: calculateAccuracy(allTimeCorrect, allTimeTotal)
      },
      typeSpecific: {
        totalQuestions: typeSpecificTotal,
        correctAnswers: typeSpecificCorrect,
        accuracy: calculateAccuracy(typeSpecificCorrect, typeSpecificTotal)
      }
    });
  }, [type]);

  // 计算准确率
  const calculateAccuracy = (correct: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  // 合并当前会话统计数据和历史数据
  const mergedStats = {
    totalQuestions: (currentStats?.totalQuestions || 0) + stats.typeSpecific.totalQuestions,
    correctAnswers: (currentStats?.correctAnswers || 0) + stats.typeSpecific.correctAnswers,
    accuracy: calculateAccuracy(
      (currentStats?.correctAnswers || 0) + stats.typeSpecific.correctAnswers,
      (currentStats?.totalQuestions || 0) + stats.typeSpecific.totalQuestions
    )
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

  // 获取训练建议
  const getTrainingSuggestion = () => {
    const accuracy = mergedStats.accuracy;
    const totalQuestions = mergedStats.totalQuestions;
    
    if (totalQuestions < 10) {
      return '继续练习以获取更多数据和建议。';
    }
    
    if (accuracy < 60) {
      return '考虑降低难度或专注于基础音程/和弦。';
    } else if (accuracy < 80) {
      return '你正在进步！继续练习以提高准确率。';
    } else if (accuracy < 95) {
      return '很好！尝试增加难度以挑战自己。';
    } else {
      return '太棒了！你已经掌握了这项技能，可以尝试更高级的内容。';
    }
  };

  return (
    <div className="training-progress p-4 border border-gray-200 rounded-lg">
      <h3 className="text-xl font-bold mb-4">{getTypeName(type)}进度</h3>
      
      {/* 当前会话统计 */}
      {currentStats && (
        <div className="current-session mb-4">
          <h4 className="text-lg font-semibold mb-2">当前会话</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="stat p-2 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">总题数</div>
              <div className="text-lg font-bold">{currentStats.totalQuestions}</div>
            </div>
            <div className="stat p-2 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">正确数</div>
              <div className="text-lg font-bold">{currentStats.correctAnswers}</div>
            </div>
            <div className="stat p-2 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">准确率</div>
              <div className="text-lg font-bold">
                {calculateAccuracy(currentStats.correctAnswers, currentStats.totalQuestions)}%
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 历史统计 */}
      <div className="history-stats mb-4">
        <h4 className="text-lg font-semibold mb-2">历史统计</h4>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="stat p-2 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-600">今日</div>
            <div className="text-md">
              {stats.today.totalQuestions} 题，准确率 {stats.today.accuracy}%
            </div>
          </div>
          <div className="stat p-2 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-600">本周</div>
            <div className="text-md">
              {stats.week.totalQuestions} 题，准确率 {stats.week.accuracy}%
            </div>
          </div>
        </div>
        <div className="stat p-2 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600">总计</div>
          <div className="text-md">
            {mergedStats.totalQuestions} 题，准确率 {mergedStats.accuracy}%
          </div>
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="progress mb-4">
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm font-semibold">总体进度</div>
          <div className="text-sm">{mergedStats.accuracy}%</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${mergedStats.accuracy}%` }}
          ></div>
        </div>
      </div>
      
      {/* 训练建议 */}
      <div className="suggestion p-3 bg-blue-50 border border-blue-100 rounded-md">
        <h4 className="text-md font-semibold mb-1">训练建议</h4>
        <p className="text-sm">{getTrainingSuggestion()}</p>
      </div>
    </div>
  );
} 