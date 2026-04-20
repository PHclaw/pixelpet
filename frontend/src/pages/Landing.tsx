import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-4 animate-bounce-slow">馃惐</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 pixel-font bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          PixelPet
        </h1>
        <p className="text-xl text-purple-200 mb-8">Your virtual pixel companion</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="text-6xl animate-bounce-slow" style={{ animationDelay: '0s' }}>馃惐</div>
        <div className="text-6xl animate-bounce-slow" style={{ animationDelay: '0.2s' }}>馃惗</div>
        <div className="text-6xl animate-bounce-slow" style={{ animationDelay: '0.4s' }}>馃悏</div>
        <div className="text-6xl animate-bounce-slow" style={{ animationDelay: '0.6s' }}>馃煝</div>
      </div>

      <div className="space-y-3 text-purple-200 text-center mb-8">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">馃幃</span>
          <span>Adopt & raise your pixel pet</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">猬嗭笍</span>
          <span>Level up & evolve your companion</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">馃懃</span>
          <span>Compete with friends on leaderboard</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">馃彧</span>
          <span>Shop for food, toys & decorations</span>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/login" className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition">
          Login
        </Link>
        <Link to="/register" className="px-8 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-semibold transition">
          Start Playing
        </Link>
      </div>
    </div>
  )
}
