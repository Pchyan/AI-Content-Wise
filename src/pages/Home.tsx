import { useState, ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { UserSettings } from '../App'

interface HomeProps {
  settings: UserSettings
}

interface AnalysisResult {
  summary: string
  thoughts: string
}

const Home = ({ settings }: HomeProps) => {
  const [inputType, setInputType] = useState<'text' | 'url'>('text')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }

  const fetchContentFromUrl = async (url: string): Promise<string> => {
    try {
      const { data } = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}&timestamp=${new Date().getTime()}`)
      
      if (!data.contents) {
        throw new Error('無法獲取網頁內容')
      }
      
      // 簡單解析 HTML 內容，獲取正文
      const parser = new DOMParser()
      const doc = parser.parseFromString(data.contents, 'text/html')
      
      // 移除腳本和樣式標籤
      const scripts = doc.querySelectorAll('script, style')
      scripts.forEach(script => script.remove())
      
      // 獲取正文內容，這裡使用簡單的方法，實際項目可能需要更複雜的提取邏輯
      const body = doc.querySelector('body')
      const paragraphs = body?.querySelectorAll('p')
      let extractedText = ''
      
      if (paragraphs && paragraphs.length > 0) {
        paragraphs.forEach(p => {
          extractedText += p.textContent + '\n\n'
        })
      } else {
        extractedText = body?.textContent || ''
      }
      
      return extractedText.trim()
    } catch (error) {
      console.error('獲取網頁內容錯誤:', error)
      throw new Error('無法獲取或解析網頁內容')
    }
  }

  const analyzeContent = async (content: string) => {
    if (!settings.apiKey) {
      setError('請先在設定頁面中設定你的 Google Gemini API Key')
      return null
    }

    // 使用設定中選擇的模型
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${settings.model}:generateContent`
    
    try {
      // 根據用戶設定的語言，準備對應的語言提示
      const languageMap: Record<string, string> = {
        'zh-TW': '台灣繁體中文',
        'zh-CN': '簡體中文',
        'en': 'English',
        'ja': '日本語',
        'ko': '한국어'
      }
      
      const outputLanguage = languageMap[settings.language] || '台灣繁體中文'
      
      const prompt = `
      請分析以下文章內容，並提供兩個部分：
      1. 總結重點：用簡短的文字概述文章的核心內容和主要觀點（200-300字）
      2. 感想生成：根據文章內容，生成一段對此文章的感想或評論（200-300字）
      
      文章內容：
      ${content}
      
      請使用 ${outputLanguage} 回覆，並按照以下 JSON 格式輸出：
      {
        "summary": "文章重點總結...",
        "thoughts": "文章感想或評論..."
      }
      `

      // 更新 API 請求格式以符合最新的 Gemini API 要求
      const response = await axios.post(
        `${apiUrl}?key=${settings.apiKey}`,
        {
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.95,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }
      )

      const responseText = response.data.candidates[0]?.content?.parts[0]?.text

      if (!responseText) {
        throw new Error('API 響應格式不正確')
      }

      // 從回應文本中提取 JSON
      const jsonMatch = responseText.match(/{[\s\S]*}/m)
      
      if (!jsonMatch) {
        throw new Error('無法從 API 回應中解析 JSON')
      }
      
      return JSON.parse(jsonMatch[0])
    } catch (error: any) {
      console.error('API 請求錯誤:', error)
      
      if (error.response) {
        if (error.response.status === 400) {
          throw new Error('文章內容可能太長或包含不適當的內容')
        } else if (error.response.status === 403) {
          throw new Error('API Key 無效或未授權')
        } else if (error.response.status === 404) {
          throw new Error('API 端點無效，請檢查 API 版本是否正確')
        } else if (error.response.status >= 500) {
          throw new Error('Google Gemini API 服務暫時無法使用，請稍後再試')
        } else {
          throw new Error(`API 錯誤 (${error.response.status}): ${error.response.data?.error?.message || '未知錯誤'}`)
        }
      } else if (error.request) {
        // 請求已發送但沒有收到回應
        throw new Error('無法連接到 Google Gemini API，請檢查網路連接')
      } else {
        throw new Error(error.message || '分析文章時發生錯誤')
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setIsLoading(true)

    try {
      let contentToAnalyze = content

      if (inputType === 'url') {
        if (!url.trim()) {
          throw new Error('請輸入有效的網址')
        }

        contentToAnalyze = await fetchContentFromUrl(url)
        
        if (!contentToAnalyze) {
          throw new Error('無法獲取網頁內容')
        }
      } else {
        if (!content.trim()) {
          throw new Error('請輸入文章內容')
        }
      }

      const analysisResult = await analyzeContent(contentToAnalyze)
      setResult(analysisResult)
    } catch (err: any) {
      setError(err.message || '處理過程中發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="mb-4 text-center">文萃智析</h1>
        <p className="text-gray-600 text-center mb-6">
          利用 Google Gemini AI 技術分析文章內容，提取重點並生成有洞見的感想，
          支援多種語言輸出，預設使用台灣繁體中文
        </p>

        {!settings.apiKey && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-700">
              你尚未設定 Google Gemini API Key。請前往
              <Link to="/settings" className="text-primary font-medium mx-1">設定頁面</Link>
              設定你的 API Key 以使用所有功能。
            </p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-2 px-4 font-medium ${inputType === 'text' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setInputType('text')}
            >
              文章內容
            </button>
            <button
              className={`py-2 px-4 font-medium ${inputType === 'url' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setInputType('url')}
            >
              網址輸入
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {inputType === 'text' ? (
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                文章內容
              </label>
              <textarea
                id="content"
                rows={8}
                value={content}
                onChange={handleContentChange}
                className="input w-full"
                placeholder="請在此輸入你想要分析的文章內容..."
              />
            </div>
          ) : (
            <div className="mb-4">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                文章網址
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={handleUrlChange}
                className="input w-full"
                placeholder="請輸入文章的網址，例如: https://example.com/article"
              />
              <p className="text-xs text-gray-500 mt-1">
                系統將自動抓取網址中的文章內容進行分析
              </p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !settings.apiKey}
            >
              {isLoading ? '分析中...' : '分析文章'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="card bg-red-50 border border-red-200 mb-6">
          <h3 className="text-red-600 mb-2">發生錯誤</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="card mb-6">
          <h2 className="mb-4">分析結果 
            <span className="text-sm font-normal text-gray-500 ml-2">
              {settings.language === 'zh-TW' ? '(繁體中文)' : 
               settings.language === 'zh-CN' ? '(簡體中文)' : 
               settings.language === 'en' ? '(English)' : 
               settings.language === 'ja' ? '(日本語)' : 
               settings.language === 'ko' ? '(한국어)' : ''}
            </span>
          </h2>
          
          <div className="mb-6">
            <h3 className="text-primary mb-2">文章重點</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="whitespace-pre-line">{result.summary}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-primary mb-2">文章感想</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="whitespace-pre-line">{result.thoughts}</p>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500 text-right">
            <p>如需更改輸出語言，請前往<Link to="/settings" className="text-primary hover:underline">設定頁面</Link>調整</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home 