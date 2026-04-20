import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { usePetStore } from '../stores/pet'
import { petApi, taskApi, shopApi } from '../services/api'

const PET_EMOJIS: Record<string, Record<string, string>> = {
  cat: { baby: '馃惐', teen: '馃樅', adult: '馃', elder: '馃憫' },
  dog: { baby: '馃惗', teen: '馃悤', adult: '馃Ξ', elder: '馃憫' },
  dragon: { baby: '馃悏', teen: '馃惒', adult: '馃敟', elder: '馃憫' },
  slime: { baby: '馃煝', teen: '馃挌', adult: '馃懢', elder: '馃憫' }
}

export default function Home() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const pet = usePetStore((s) => s.pet)
  const setPet = usePetStore((s) => s.setPet)
  const updateStats = usePetStore((s) => s.updateStats)
  
  const [loading, setLoading] = useState(true)
  const [showAdopt, setShowAdopt] = useState(false)
  const [adoptName, setAdoptName] = useState('')
  const [adoptType, setAdoptType] = useState('cat')
  const [inventory, setInventory] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const petRes = await petApi.get()
      setPet(petRes.data)
      const invRes = await shopApi.inventory()
      setInventory(invRes.data)
      const taskRes = await taskApi.list()
      setTasks(taskRes.data)
    } catch (e: any) {
      if (e.response?.status === 404) {
        setShowAdopt(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAdopt = async () => {
    if (!adoptName.trim()) return
    try {
      const res = await petApi.adopt({ name: adoptName, pet_type: adoptType })
      setPet(res.data)
      setShowAdopt(false)
      setMessage(`${adoptName} joined your family!`)
    } catch (e) {
      console.error(e)
    }
  }

  const handleFeed = async (itemId: number) => {
    try {
      const res = await petApi.feed(itemId)
      setMessage(res.data.message)
      loadData()
    } catch (e: any) {
      setMessage(e.response?.data?.detail || 'Failed to feed')
    }
  }

  const handlePlay = async () => {
    try {
      const res = await petApi.play()
      setMessage(res.data.message)
      loadData()
    } catch (e: any) {
      setMessage(e.response?.data?.detail || 'Failed to play')
    }
  }

  const handleTask = async (taskId: number) => {
    try {
      const res = await taskApi.complete(taskId)
      setMessage(res.data.message)
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const getPetEmoji = () => {
    if (!pet) return '鉂?
    return PET_EMOJIS[pet.pet_type]?.[pet.stage] || '馃惐'
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black">
      {/* Header */}
      <nav className="bg-black/30 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">馃惐</span>
          <span className="font-bold pixel-font text-purple-400">PixelPet</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-yellow-400">馃挵 {user?.coins || 0}</span>
          <Link to="/shop" className="text-purple-400 hover:underline">Shop</Link>
          <Link to="/social" className="text-purple-400 hover:underline">Social</Link>
          <button onClick={logout} className="text-gray-400 hover:text-white">Logout</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4">
        {message && (
          <div className="mb-4 p-3 bg-purple-600/50 rounded-lg text-center animate-pulse">
            {message}
          </div>
        )}

        {/* Adopt Modal */}
        {showAdopt && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 pixel-font text-center">Adopt a Pet</h2>
              
              <div className="grid grid-cols-4 gap-2 mb-4">
                {['cat', 'dog', 'dragon', 'slime'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setAdoptType(t)}
                    className={`p-3 rounded-lg text-4xl ${adoptType === t ? 'bg-purple-600 ring-2 ring-purple-400' : 'bg-gray-700'}`}
                  >
                    {PET_EMOJIS[t].baby}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Name your pet"
                value={adoptName}
                onChange={(e) => setAdoptName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg mb-4"
              />

              <button
                onClick={handleAdopt}
                className="w-full py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-semibold"
              >
                Adopt {adoptType.charAt(0).toUpperCase() + adoptType.slice(1)}
              </button>
            </div>
          </div>
        )}

        {/* Pet Display */}
        {pet && (
          <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{pet.name}</h2>
                <p className="text-gray-400">Lv.{pet.level} {pet.stage} {pet.pet_type}</p>
              </div>
              <div className="text-8xl animate-bounce-slow">{getPetEmoji()}</div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span>馃崠 Hunger</span>
                  <span>{Math.round(pet.hunger)}%</span>
                </div>
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 transition-all" style={{ width: `${pet.hunger}%` }} />
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span>馃槉 Happy</span>
                  <span>{Math.round(pet.happiness)}%</span>
                </div>
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 transition-all" style={{ width: `${pet.happiness}%` }} />
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span>鈿?Energy</span>
                  <span>{Math.round(pet.energy)}%</span>
                </div>
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 transition-all" style={{ width: `${pet.energy}%` }} />
                </div>
              </div>
            </div>

            {/* EXP Bar */}
            <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span>鉁?Experience</span>
                <span>{pet.exp} / {(pet.level + 1) * 100}</span>
              </div>
              <div className="h-3 bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 transition-all" style={{ width: `${(pet.exp / ((pet.level + 1) * 100)) * 100}%` }} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handlePlay}
                disabled={pet.energy < 10}
                className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
              >
                馃幘 Play
              </button>
            </div>
          </div>
        )}

        {/* Daily Tasks */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <h3 className="font-bold mb-3">馃搵 Daily Tasks</h3>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                <span>{task.task_type === 'feed' ? '馃崠 Feed your pet' : task.task_type === 'play' ? '馃幘 Play with pet' : '馃憢 Visit a friend'}</span>
                {task.completed ? (
                  <span className="text-green-400">鉁?Done</span>
                ) : (
                  <button
                    onClick={() => handleTask(task.id)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                  >
                    +{task.reward_coins} coins
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Inventory */}
        {inventory.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-bold mb-3">馃帓 Inventory</h3>
            <div className="grid grid-cols-4 gap-2">
              {inventory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleFeed(item.item_id)}
                  className="p-3 bg-gray-700/50 rounded-lg text-center hover:bg-gray-600/50"
                >
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <div className="text-xs">{item.name}</div>
                  <div className="text-xs text-gray-400">x{item.quantity}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
