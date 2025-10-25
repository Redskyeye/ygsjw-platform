export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            欢迎来到史诗AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI驱动的职业规划与指导平台
          </p>
          <div className="space-x-4">
            <button className="btn-primary">开始探索</button>
            <button className="btn-secondary">了解更多</button>
          </div>
        </div>
      </div>
    </main>
  );
}
