import { LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import { useI18n } from '../i18n'

export default function Sidebar({ user, items, active, onSelect, onLogout, roleLabel, theme, onToggleTheme }) {
  const { t } = useI18n()
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-base-700 bg-base-900 md:flex">
      <div className="px-5 pb-4 pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">{t('brand.line1')}</p>
        <p className="text-sm font-bold text-paper">{t('brand.line2')}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.key === active
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`tap flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                isActive ? 'bg-amber/15 text-amber' : 'text-muted hover:bg-base-800 hover:text-paper'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-base-700 px-3 py-3">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <div className="mt-1">
          <LanguageSwitcher placement="up" />
        </div>
      </div>

      <div className="border-t border-base-700 px-3 py-4">
        <div className="px-2">
          <p className="truncate text-sm font-semibold text-paper">{user.name}</p>
          <p className="text-xs text-muted">{roleLabel}</p>
        </div>
        <button
          onClick={onLogout}
          className="tap mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-alert hover:bg-alert/10"
        >
          <LogOut size={16} /> {t('common.logout')}
        </button>
      </div>
    </aside>
  )
}
