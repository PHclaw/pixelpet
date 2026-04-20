import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { shopApi } from '../services/api'

interface Item {
  id: number
  name: string
  type: string
  price: number
  hunger: number
  happiness: number
  energy: number
  emoji: string
}

export default function Shop() {
  const [items, setItems] = useState<Item[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [itemsRes, invRes] = await Promise.all([
        shopApi.items(),
        shopApi.inventory()
      ])
      setItems(itemsRes.data)
      setInventory(invRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async (itemId: number) => {
    try {
      const res = await shopApi.buy(itemId)
      setMessage(res.data.message)
      loadData()
    } catch (e: any) {
      setMessage(e.response?.data?.detail || 'Purchase failed')
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

      <main className="max-w-4xl mx-auto p-4">
        {message && (
          <div className="mb-4 p-3 bg-purple-600/50 rounded-lg text-center">
            {message}
          </div>
        )}

        <h1 className="text-2xl font-bold mb-6 pixel-font">馃彧 Shop</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-5xl text-center mb-2">{item.emoji}</div>
              <h3 className="font-bold text-center mb-2">{item.name}</h3>
              <div className="text-xs text-gray-400 text-center mb-3">
                {item.hunger > 0 && <span>馃崠+{item.hunger} </span>}
                {item.happiness > 0 && <span>馃槉+{item.happiness} </span>}
                {item.energy > 0 && <span>鈿?{item.energy}</span>}
              </div>
              <button
                onClick={() => handleBuy(item.id)}
                className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold"
              >
                馃挵 {item.price}
              </button>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mt-8 mb-4">馃帓 Your Inventory</h2>
        {inventory.length > 0 ? (
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {inventory.map((item) => (
              <div key={item.id} className="bg-gray-800/50 rounded-lg p-2 text-center">
                <div className="text-2xl">{item.emoji}</div>
                <div className="text-xs">{item.name}</div>
                <div className="text-xs text-gray-400">x{item.quantity}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No items yet</p>
        )}
      </main>
    </div>
  )
}
