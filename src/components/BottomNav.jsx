export default function BottomNav({ items, active, onSelect }) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-base-700 bg-base-900/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md">
        {items.map((item) => {
          const isActive = item.key === active
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className="tap flex flex-1 flex-col items-center gap-1 py-2.5"
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} className={isActive ? 'text-amber' : 'text-muted'} />
              <span className={`text-[11px] font-medium ${isActive ? 'text-amber' : 'text-muted'}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
