import Link from "next/link";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          动画演示页面
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/demo/sequence-animation"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">动画序列播放</h2>
            <p className="text-gray-600">
              演示多个动画的连续播放，支持状态切换和循环播放
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}