import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { socialApi } from '../services/api'

export default function Social() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('leaderboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [lbRes, followingRes] = await Promise.all([
        socialApi.leaderboard(),
        socialApi.following()
      ])
      setLeaderboard(lbRes.data)
      setFollowing(followingRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black">
      <nav className="bg-black/30 px-4 py-3 flex justify-between items-center">
        <Link to="/home" className="flex items-center gap-2">
          <span className="text-2xl">馃惐</span>
          <span className="font-bold pixel-font text-purple-400">PixelPet</span>
        </Link>
        <Link to="/home" className="text-purple-400 hover:underline">Back Home</Link>
      </nav>

      <main className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 pixel-font">馃懃 Social</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'leaderboard' ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            馃弳 Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'following' ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            馃憢 Following
          </button>
        </div>

        {activeTab === 'leaderboard' && (
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-lg ${i < 3 ? 'bg-yellow-900/30' : 'bg-gray-800/50'}`}>
                <span className="text-2xl font-bold w-8">
                  {i === 0 ? '馃' : i === 1 ? '馃' : i === 2 ? '馃' : `#${entry.rank}`}
                </span>
                <div className="flex-1">
                  <div className="font-bold">{entry.username}</div>
                  <div className="text-sm text-gray-400">{entry.pet_name} the {entry.pet_type}</div>
                </div>
                <div className="text-purple-400 font-bold">Lv.{entry.level}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="space-y-2">
            {following.length > 0 ? (
              following.map((entry, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-3xl">馃惐</div>
                  <div className="flex-1">
                    <div className="font-bold">{entry.username}</div>
                    <div className="text-sm text-gray-400">{entry.pet_name} Lv.{entry.level}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">Not following anyone yet</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
