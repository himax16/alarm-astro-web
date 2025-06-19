"use client"

import { useState } from "react"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function AlarmForm({ onSubmit, initialData, isEditing }) {
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    name: initialData?.name || "",
    time: initialData?.time || "",
    days: initialData?.days || [],
    soundEnabled: initialData?.soundEnabled ?? false,
    enabled: initialData?.enabled ?? true,
    category: initialData?.category || "General",
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleDayToggle = (day) => {
    const newDays = formData.days.includes(day) ? formData.days.filter((d) => d !== day) : [...formData.days, day]

    setFormData({
      ...formData,
      days: newDays,
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.time) {
      newErrors.time = "Time is required"
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.time)) {
      newErrors.time = "Time must be in HH:MM format"
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 text-base">
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Alarm Name (optional)"
        />
        <input
          type="time"
          id="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.time ? "border-red-500" : "border-gray-300"
          }`}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.category ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Category"
        />
        <div className="flex flex-wrap items-center gap-2">
          {/* Day selection buttons */}
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none ${
                formData.days.includes(day) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={{ minWidth: 40 }}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end pt-2 gap-4 items-center">
        {/* Slider buttons for Sound and Active, more compact */}
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 items-center">
          <div className="flex items-center gap-1 min-w-[100px]">
            <span className="text-sm">Sound</span>
            <label className="relative inline-flex items-center cursor-pointer align-middle">
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={() => setFormData({ ...formData, soundEnabled: !formData.soundEnabled })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:bg-green-600 transition-colors"></div>
              <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.soundEnabled ? 'translate-x-4' : ''}`}></div>
            </label>
          </div>
          <div className="flex items-center gap-1 min-w-[100px]">
            <span className="text-sm">Active</span>
            <label className="relative inline-flex items-center cursor-pointer align-middle">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={() => setFormData({ ...formData, enabled: !formData.enabled })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:bg-green-600 transition-colors"></div>
              <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.enabled ? 'translate-x-4' : ''}`}></div>
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors text-base font-semibold"
        >
          {isEditing ? "Update" : "Add"}
        </button>
      </div>
    </form>
  )
}
