'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { collection, query, where, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
  dietaryInfo: string[]
  imageUrl?: string
}

interface MenuSection {
  id: string
  name: string
  items: MenuItem[]
}

export default function MenuManagement({ restaurantId }: { restaurantId: string }) {
  const { user } = useAuth()
  const [sections, setSections] = useState<MenuSection[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  useEffect(() => {
    const fetchMenu = async () => {
      if (!user) return

      try {
        const sectionsRef = collection(db, 'restaurants', restaurantId, 'menuSections')
        const sectionsSnapshot = await getDocs(sectionsRef)
        
        const sectionsData = await Promise.all(
          sectionsSnapshot.docs.map(async (doc) => {
            const itemsRef = collection(db, 'restaurants', restaurantId, 'menuSections', doc.id, 'items')
            const itemsSnapshot = await getDocs(itemsRef)
            
            return {
              id: doc.id,
              ...doc.data(),
              items: itemsSnapshot.docs.map(itemDoc => ({
                id: itemDoc.id,
                ...itemDoc.data()
              }))
            } as MenuSection
          })
        )

        setSections(sectionsData)
      } catch (error) {
        console.error('Error fetching menu:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [user, restaurantId])

  const handleUpdateItem = async (item: MenuItem) => {
    try {
      const itemRef = doc(
        db,
        'restaurants',
        restaurantId,
        'menuSections',
        item.category,
        'items',
        item.id
      )
      
      // Create a sanitized version of the item for Firestore
      const { id, ...itemData } = item
      await updateDoc(itemRef, itemData)
      
      setSections(prev => prev.map(section => {
        if (section.id === item.category) {
          return {
            ...section,
            items: section.items.map(i => i.id === item.id ? item : i)
          }
        }
        return section
      }))
    } catch (error) {
      console.error('Error updating menu item:', error)
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Menu Management</h2>

      {sections.map((section) => (
        <div key={section.id} className="space-y-4">
          <h3 className="text-lg font-medium">{section.name}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => setEditingItem(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {editingItem && (
        <MenuItemDialog
          item={editingItem}
          onSave={handleUpdateItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  )
}

function MenuItemDialog({ 
  item, 
  onSave, 
  onClose 
}: { 
  item: MenuItem
  onSave: (item: MenuItem) => Promise<void>
  onClose: () => void
}) {
  const [formData, setFormData] = useState(item)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving item:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Edit Menu Item</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 