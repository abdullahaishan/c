// src/pages/admin/Plans.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Edit, Save, X, Plus, Crown, Check } from 'lucide-react'

const Plans = () => {
  const [plans, setPlans] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    const { data } = await supabase
      .from('plans')
      .select('*')
      .order('sort_order')
    setPlans(data || [])
  }

  const handleEdit = (plan) => {
    setEditingId(plan.id)
    setEditData(plan)
  }

  const handleSave = async () => {
    await supabase
      .from('plans')
      .update(editData)
      .eq('id', editingId)
    setEditingId(null)
    fetchPlans()
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Manage Plans</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(plan => (
          <div
            key={plan.id}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            {editingId === plan.id ? (
              // Edit Mode
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <input
                  type="number"
                  value={editData.price_monthly}
                  onChange={(e) => setEditData({ ...editData, price_monthly: e.target.value })}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="Monthly Price"
                />
                <input
                  type="number"
                  value={editData.price_yearly}
                  onChange={(e) => setEditData({ ...editData, price_yearly: e.target.value })}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="Yearly Price"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg"
                  >
                    <Save className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg"
                  >
                    <X className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-center justify-between mb-4">
                  <Crown className={`w-8 h-8 ${
                    plan.id === 1 ? 'text-gray-400' :
                    plan.id === 2 ? 'text-blue-400' :
                    plan.id === 3 ? 'text-yellow-400' : 'text-purple-400'
                  }`} />
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{plan.name_ar}</p>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-white">${plan.price_monthly}</p>
                  <p className="text-sm text-gray-400">per month</p>
                  {plan.price_yearly && (
                    <p className="text-sm text-green-400">${plan.price_yearly}/year</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Max Projects</span>
                    <span className="text-white">{plan.max_projects}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Max Skills</span>
                    <span className="text-white">{plan.max_skills}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Storage</span>
                    <span className="text-white">{plan.storage_limit}MB</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={plan.custom_domain}
                      onChange={async (e) => {
                        await supabase
                          .from('plans')
                          .update({ custom_domain: e.target.checked })
                          .eq('id', plan.id)
                        fetchPlans()
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300">Custom Domain</span>
                  </label>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Plans