import { Menu, LogOut, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

interface HeaderProps {
  onMenuClick: () => void
  title: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 ml-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-800 text-xs font-bold text-white">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="hidden text-sm font-medium text-gray-700 sm:block">
            {user?.name}
          </span>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="ml-1 rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
