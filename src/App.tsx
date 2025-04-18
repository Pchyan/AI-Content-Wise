import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import localforage from 'localforage'
import useSuppressWarnings from './hooks/useSuppressWarnings'

// 頁面
import Home from './pages/Home'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

// 組件
import Layout from './components/Layout'

// 設定 localforage
localforage.config({
  name: 'ContentWise',
  storeName: 'user_settings'
})

export interface UserSettings {
  apiKey: string;
  model: string;
  language: string;
}

function App() {
  // 抑制 React Router 警告
  useSuppressWarnings();
  
  const [settings, setSettings] = useState<UserSettings>({ 
    apiKey: '',
    model: 'gemini-2.0-flash',
    language: 'zh-TW'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await localforage.getItem<UserSettings>('settings')
        if (savedSettings) {
          setSettings(savedSettings)
        }
      } catch (error) {
        console.error('讀取設定時發生錯誤:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const updateSettings = async (newSettings: UserSettings) => {
    try {
      await localforage.setItem('settings', newSettings)
      setSettings(newSettings)
      return true
    } catch (error) {
      console.error('儲存設定時發生錯誤:', error)
      return false
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">載入中...</div>
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home settings={settings} />} />
        <Route path="settings" element={<Settings settings={settings} updateSettings={updateSettings} />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App 