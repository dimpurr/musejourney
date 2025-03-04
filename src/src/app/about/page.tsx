import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">关于 MuseJourney</h1>
      
      <div className="max-w-3xl mx-auto">
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">项目介绍</h2>
          <p className="text-gray-700 mb-4">
            MuseJourney 是一个交互式乐理教程平台，旨在通过现代网络技术和交互式学习方法，
            帮助音乐爱好者和学习者更好地理解和掌握音乐理论知识。
          </p>
          <p className="text-gray-700 mb-4">
            我们相信，音乐理论不应该是枯燥的规则和公式，而应该是活生生的、可听可见的知识。
            通过将抽象的音乐概念可视化，并提供即时的听觉反馈，我们希望让学习乐理变得更加
            直观、有趣且高效。
          </p>
          <p className="text-gray-700">
            无论您是音乐初学者，还是希望深入了解和声理论的进阶学习者，MuseJourney 都能
            为您提供个性化的学习路径和丰富的互动工具。
          </p>
        </section>
        
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">技术栈</h2>
          <p className="text-gray-700 mb-4">
            MuseJourney 使用现代 Web 技术构建，包括：
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Next.js</strong> - React 框架，提供服务端渲染和静态生成</li>
            <li><strong>TypeScript</strong> - 类型安全的 JavaScript 超集</li>
            <li><strong>Tailwind CSS</strong> - 实用优先的 CSS 框架</li>
            <li><strong>Tone.js</strong> - Web Audio API 的封装，用于音频处理</li>
            <li><strong>Tonal.js</strong> - 音乐理论库，提供和弦、音阶等功能</li>
            <li><strong>Web MIDI API</strong> - 用于 MIDI 设备连接</li>
            <li><strong>Vexflow</strong> - 用于乐谱渲染</li>
          </ul>
          <p className="text-gray-700">
            我们致力于使用最新的 Web 技术，为用户提供流畅、响应式的学习体验。
          </p>
        </section>
        
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">开发团队</h2>
          <p className="text-gray-700 mb-4">
            MuseJourney 是一个开源项目，由一群热爱音乐和技术的开发者共同创建。
            我们欢迎各种形式的贡献，包括代码贡献、内容编写、错误报告和功能建议。
          </p>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="text-lg font-semibold mb-2">参与贡献</h3>
            <p className="text-gray-700 mb-2">
              如果您对项目感兴趣，欢迎通过以下方式参与：
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>在 GitHub 上提交 Issue 或 Pull Request</li>
              <li>帮助编写或翻译教程内容</li>
              <li>分享您的音乐理论知识和教学经验</li>
              <li>测试平台并提供反馈</li>
            </ul>
          </div>
        </section>
        
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">联系我们</h2>
          <p className="text-gray-700 mb-4">
            如有任何问题、建议或合作意向，请通过以下方式联系我们：
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">电子邮件</h3>
              <p className="text-gray-600">contact@musejourney.com</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">GitHub</h3>
              <a 
                href="https://github.com/musejourney/musejourney" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                github.com/musejourney
              </a>
            </div>
          </div>
        </section>
        
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
} 