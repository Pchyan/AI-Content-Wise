import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
      <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">找不到頁面</h2>
      <p className="text-gray-600 mb-8">
        很抱歉，你所請求的頁面不存在或已被移除。
      </p>
      <Link to="/" className="btn btn-primary">
        返回首頁
      </Link>
    </div>
  )
}

export default NotFound 