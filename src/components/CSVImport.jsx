"use client"

import { useState } from "react"

function parseCSV(text) {
  // Simple CSV parser for comma-separated values with quoted fields
  const rows = []
  let current = []
  let field = ""
  let inQuotes = false
  let i = 0

  while (i < text.length) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ",") {
        current.push(field)
        field = ""
      } else if (char === "\r") {
        // ignore
      } else if (char === "\n") {
        current.push(field)
        rows.push(current)
        current = []
        field = ""
      } else {
        field += char
      }
    }
    i++
  }
  if (field.length > 0 || current.length > 0) {
    current.push(field)
    rows.push(current)
  }
  return rows
}

export default function CSVImport({ onImport }) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file")
      return
    }

    setIsUploading(true)
    setError("")
    setSuccessMessage("")

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target.result
        const rows = parseCSV(text).filter(row => row.length > 1)
        if (rows.length < 2) {
          setIsUploading(false)
          setError("CSV file is empty or missing data")
          return
        }
        const headers = rows[0].map(h => h.trim())
        const data = rows.slice(1).map(row => {
          const obj = {}
          headers.forEach((header, idx) => {
            obj[header] = row[idx] ? row[idx].trim() : ""
          })
          return obj
        })

        const parsedAlarms = data
          .filter((row) => row.time && row.name)
          .map((row) => ({
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            time: row.time,
            name: row.name,
            days: row.days ? row.days.split(";").map((day) => day.trim()) : [],
            enabled: row.enabled === "true" || row.enabled === "1" || row.enabled === "yes",
            category: row.category || "General",
            soundEnabled: row.soundEnabled === "true" || row.soundEnabled === "1" || row.soundEnabled === "yes" ? true : false,
          }))

        setIsUploading(false)

        if (parsedAlarms.length === 0) {
          setError("No valid alarms found in the CSV file")
          return
        }

        onImport(parsedAlarms)
        setSuccessMessage(`Successfully imported ${parsedAlarms.length} alarms`)
        event.target.value = null // Reset file input
      } catch (e) {
        setIsUploading(false)
        setError("Error processing CSV data")
        console.error("CSV processing error:", e)
      }
    }
    reader.onerror = (e) => {
      setIsUploading(false)
      setError("Error reading CSV file")
      console.error("CSV reading error:", e)
    }
    reader.readAsText(file)
  }

  const handleDownloadTemplate = () => {
    const csvContent =
      "time,name,days,enabled,category\n" +
      "07:00,Morning Alarm,Monday;Tuesday;Wednesday;Thursday;Friday,true,Work\n" +
      "09:00,Weekend Alarm,Saturday;Sunday,true,Personal"
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", "alarm_template.csv")
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-grow">
          <label
            htmlFor="csv-upload"
            className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 mb-2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span className="text-gray-600 mb-1">Click to upload CSV file</span>
              <span className="text-xs text-gray-500">or drag and drop</span>
            </div>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        <div className="w-full sm:w-auto">
          <button
            onClick={handleDownloadTemplate}
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Template
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

      {successMessage && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{successMessage}</div>}

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">CSV Format Instructions</h3>
        <p className="text-sm text-blue-700 mb-2">Your CSV file should include the following columns in this order:</p>
        <ul className="text-xs text-blue-700 list-disc pl-5 space-y-1">
          <li>
            <strong>time</strong> - Time in HH:MM format (required)
          </li>
          <li>
            <strong>name</strong> - Alarm name (required)
          </li>
          <li>
            <strong>days</strong> - Semicolon-separated list of days (e.g. Monday;Tuesday) (optional)
          </li>
          <li>
            <strong>enabled</strong> - "true" or "false" (optional, defaults to true)
          </li>
          <li>
            <strong>category</strong> - Category name (optional, defaults to "General")
          </li>
        </ul>
      </div>
    </div>
  )
}
