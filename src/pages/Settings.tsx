import { useState, ChangeEvent, FormEvent } from 'react'
import { UserSettings } from '../App'
import { FaEye, FaEyeSlash, FaQuestionCircle, FaLanguage } from 'react-icons/fa'

interface SettingsProps {
  settings: UserSettings
  updateSettings: (newSettings: UserSettings) => Promise<boolean>
}

const Settings = ({ settings, updateSettings }: SettingsProps) => {
  const [apiKey, setApiKey] = useState(settings.apiKey || '')
  const [model, setModel] = useState(settings.model || 'gemini-2.0-flash')
  const [language, setLanguage] = useState(settings.language || 'zh-TW')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleApiKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value)
  }

  const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value)
  }

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value)
  }

  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const success = await updateSettings({ apiKey, model, language })
      
      if (success) {
        setMessage({
          type: 'success',
          text: '設定已成功儲存！'
        })
      } else {
        throw new Error('無法儲存設定')
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || '儲存設定時發生錯誤'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="mb-6 text-center">設定</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                id="apiKey"
                value={apiKey}
                onChange={handleApiKeyChange}
                className="input w-full pr-10"
                placeholder="請輸入你的 API Key"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={toggleShowApiKey}
              >
                {showApiKey ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="mt-2 flex items-start">
              <div className="flex-shrink-0">
                <FaQuestionCircle className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-2 text-sm text-gray-500">
                <p>你可以在 <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a> 建立 API Key。</p>
                <p className="mt-1">此 API Key 將只儲存在你的瀏覽器本地，不會被傳送到我們的伺服器。</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Google Gemini 模型版本
            </label>
            <select
              id="model"
              value={model}
              onChange={handleModelChange}
              className="input w-full"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (推薦)</option>
              <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (更快速)</option>
              <option value="gemini-1.5-pro-002">Gemini 1.5 Pro 002 (豐富功能)</option>
              <option value="gemini-1.5-flash-002">Gemini 1.5 Flash 002 (較輕量)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              根據 Google 文件，推薦使用 Gemini 2.0 Flash 作為最新穩定版本。
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FaLanguage className="mr-1" /> 分析結果語言
              </div>
            </label>
            <select
              id="language"
              value={language}
              onChange={handleLanguageChange}
              className="input w-full"
            >
              <option value="zh-TW">繁體中文 (台灣)</option>
              <option value="zh-CN">簡體中文</option>
              <option value="en">英文 (English)</option>
              <option value="ja">日文 (日本語)</option>
              <option value="ko">韓文 (한국어)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              選擇 AI 分析後產生的文章重點與感想所使用的語言。
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-md mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-center">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? '儲存中...' : '儲存設定'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings 