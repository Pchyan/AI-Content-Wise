import { Link, Outlet } from 'react-router-dom'
import { FaCog, FaHome } from 'react-icons/fa'

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold flex items-center">
            <img src="./favicon.svg" alt="Logo" className="w-6 h-6 mr-2" />
            文萃智析
          </Link>
          <nav className="flex space-x-4">
            <Link to="/" className="flex items-center hover:text-primary-light">
              <FaHome className="mr-1" /> 首頁
            </Link>
            <Link to="/settings" className="flex items-center hover:text-primary-light">
              <FaCog className="mr-1" /> 設定
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} 文萃智析 (ContentWise) | 用 AI 探索文章精髓
        </div>
      </footer>
    </div>
  )
}

export default Layout 