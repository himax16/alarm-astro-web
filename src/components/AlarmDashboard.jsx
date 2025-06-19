"use client"

import { useState, useEffect } from "react"
import CSVImport from "./CSVImport"
import AlarmList from "./AlarmList"
import AlarmForm from "./AlarmForm"

export default function AlarmDashboard() {
  const [alarms, setAlarms] = useState([])
  const [isAddingAlarm, setIsAddingAlarm] = useState(false)
  const [editingAlarm, setEditingAlarm] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Load alarms from localStorage on component mount
  useEffect(() => {
    const savedAlarms = localStorage.getItem("alarms")
    if (savedAlarms) {
      try {
        setAlarms(JSON.parse(savedAlarms))
      } catch (e) {
        console.error("Error loading alarms from localStorage", e)
      }
    }
  }, [])

  // Save alarms to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("alarms", JSON.stringify(alarms))
  }, [alarms])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Play alarm sound only if enabled
  const playAlarmSound = (alarm) => {
    if (alarm.soundEnabled !== false) {
      const audio = new window.Audio(`/sounds/default.wav`)
      audio.play().catch(() => {})
    }
  }

  // Show notification (if supported)
  const showAlarmNotification = (alarm) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Alarm${alarm.name ? `: ${alarm.name}` : ''}`, {
        body: `Time: ${alarm.time}${alarm.category ? `\nCategory: ${alarm.category}` : ''}`,
        icon: "/favicon.svg"
      })
    }
  }

  // Request notification permission on mount (for mobile/desktop)
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission()
    }
  }, [])

  // Alarm functionality: check every second if any alarm should ring
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date()
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' })
      const currentTimeStr = now.toTimeString().slice(0,5)
      alarms.forEach(alarm => {
        if (
          alarm.enabled &&
          alarm.time === currentTimeStr &&
          (!alarm.days || alarm.days.length === 0 || alarm.days.includes(currentDay))
        ) {
          if (!alarm._triggered || alarm._lastTrigger !== currentTimeStr) {
            alert(`Alarm${alarm.name ? `: ${alarm.name}` : ''} - ${alarm.time}`)
            // Play sound and show notification together
            playAlarmSound(alarm)
            showAlarmNotification(alarm)
            alarm._triggered = true
            alarm._lastTrigger = currentTimeStr
          }
        } else {
          alarm._triggered = false
        }
      })
    }
    const interval = setInterval(checkAlarms, 1000)
    return () => clearInterval(interval)
  }, [alarms])

  const handleImportAlarms = (importedAlarms) => {
    // Merge imported alarms with existing ones, avoiding duplicates
    const newAlarms = [...alarms]

    importedAlarms.forEach((importedAlarm) => {
      const exists = alarms.some(
        (alarm) =>
          alarm.name === importedAlarm.name && alarm.time === importedAlarm.time
      )

      if (!exists) {
        newAlarms.push({
          ...importedAlarm,
          id: Date.now() + Math.random().toString(36).substr(2, 9),
        })
      }
    })

    setAlarms(newAlarms)
  }

  const handleAddAlarm = (alarm) => {
    setAlarms([...alarms, { ...alarm, id: Date.now().toString() }])
    setIsAddingAlarm(false)
  }

  const handleUpdateAlarm = (updatedAlarm) => {
    setAlarms(alarms.map((alarm) => (alarm.id === updatedAlarm.id ? updatedAlarm : alarm)))
    setEditingAlarm(null)
    setIsAddingAlarm(false) // Auto-close the dialog after update
  }

  const handleDeleteAlarm = (id) => {
    setAlarms(alarms.filter((alarm) => alarm.id !== id))
  }

  const handleEditAlarm = (alarm) => {
    setEditingAlarm(alarm)
    setIsAddingAlarm(true)
  }

  const handleToggleEnabled = (alarm) => {
    setAlarms(alarms.map((a) =>
      a.id === alarm.id ? { ...a, enabled: !a.enabled } : a
    ))
  }

  return (
    <div className="grid gap-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2">Current Time</h2>
        <div className="text-4xl font-mono tracking-widest">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
        <div className="text-lg text-gray-500">{currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isAddingAlarm ?
              (editingAlarm ? "Edit Alarm" : "Add Alarms") : "Your Alarms"}
          </h2>
          <button
            onClick={() => {
              setIsAddingAlarm(!isAddingAlarm)
              setEditingAlarm(null)
            }}
            className={`px-4 py-2 rounded-lg transition-colors text-white ${isAddingAlarm ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isAddingAlarm ? "Cancel" : "Add Alarm"}
          </button>
        </div>

        {isAddingAlarm ? (
          <AlarmForm
            onSubmit={editingAlarm ? handleUpdateAlarm : handleAddAlarm}
            initialData={editingAlarm}
            isEditing={!!editingAlarm}
          />
        ) : (
          <AlarmList alarms={alarms} onDelete={handleDeleteAlarm} onEdit={handleEditAlarm} onToggleEnabled={handleToggleEnabled} />
        )}
      </div>

      {/* CSV Import in a separate island below all alarms */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <details>
          <summary className="cursor-pointer text-blue-700 font-medium mb-2">Import Alarms from CSV</summary>
          <div className="mt-4">
            <CSVImport onImport={handleImportAlarms} />
          </div>
        </details>
      </div>
    </div>
  )
}
