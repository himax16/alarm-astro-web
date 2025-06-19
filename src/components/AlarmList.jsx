"use client"

import { useState } from "react"

export default function AlarmList({ alarms, onDelete, onEdit, onToggleEnabled }) {
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [enabledFilter, setEnabledFilter] = useState("all")

  const categories = ["all", ...new Set(alarms.map((alarm) => alarm.category))]

  const filteredAlarms = alarms.filter((alarm) => {
    const matchesCategory = filter === "all" || alarm.category === filter
    const matchesSearch = alarm.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEnabled =
      enabledFilter === "all" ||
      (enabledFilter === "enabled" && alarm.enabled) ||
      (enabledFilter === "disabled" && !alarm.enabled)
    return matchesCategory && matchesSearch && matchesEnabled
  })

  if (alarms.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">You don't have any alarms yet</p>
        <p className="text-sm text-gray-400">Import alarms from a CSV file or add them manually</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search alarms..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "All Categories" : category}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={enabledFilter}
          onChange={(e) => setEnabledFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredAlarms.length === 0 ? (
          <div className="text-center py-6 col-span-full">
            <p className="text-gray-500">No alarms match your search</p>
          </div>
        ) : (
          filteredAlarms.map((alarm) => (
            <div
              key={alarm.id}
              className="flex flex-col justify-between h-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${alarm.enabled ? "bg-green-600" : "bg-gray-300"}`}></div>
                <div>
                  {alarm.time && (
                    <h3 className="font-medium">{alarm.time}</h3>
                  )}
                  <div className="flex gap-4 text-sm text-gray-500">
                    {alarm.days && alarm.days.length > 0 && (
                      <span>{alarm.days.map((day) => day.substring(0, 3)).join(", ")}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">{alarm.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-0 mt-auto">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{alarm.category}</span>
                <span className="flex-1"></span>
                <label className="flex items-center cursor-pointer mr-2">
                  <input
                    type="checkbox"
                    checked={alarm.enabled}
                    onChange={() => onToggleEnabled(alarm)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 bg-gray-300 rounded-full shadow-inner transition-colors duration-200 ${alarm.enabled ? "bg-green-600" : ""}`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${alarm.enabled ? "translate-x-5" : ""}`}
                    ></div>
                  </div>
                </label>
                <button
                  onClick={() => onEdit(alarm)}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(alarm.id)}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
