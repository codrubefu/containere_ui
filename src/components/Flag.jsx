import { useId } from 'react'

// Steaguri SVG inline — emoji-urile de steag nu se afișează pe Windows.
export default function Flag({ code, className = '' }) {
  const id = useId()
  return (
    <svg
      viewBox={code === 'en' ? '0 0 60 30' : '0 0 3 2'}
      preserveAspectRatio="xMidYMid slice"
      className={`h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10 ${className}`}
      aria-hidden
    >
      {code === 'ro' && (
        <>
          <rect width="1" height="2" fill="#002B7F" />
          <rect x="1" width="1" height="2" fill="#FCD116" />
          <rect x="2" width="1" height="2" fill="#CE1126" />
        </>
      )}
      {code === 'de' && (
        <>
          <rect width="3" height="0.667" fill="#000" />
          <rect y="0.667" width="3" height="0.667" fill="#DD0000" />
          <rect y="1.333" width="3" height="0.667" fill="#FFCE00" />
        </>
      )}
      {code === 'nl' && (
        <>
          <rect width="3" height="0.667" fill="#AE1C28" />
          <rect y="0.667" width="3" height="0.667" fill="#FFF" />
          <rect y="1.333" width="3" height="0.667" fill="#21468B" />
        </>
      )}
      {code === 'en' && (
        <>
          <clipPath id={`${id}t`}>
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <rect width="60" height="30" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFF" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}t)`} stroke="#C8102E" strokeWidth="4" />
          <path d="M30,0 v30 M0,15 h60" stroke="#FFF" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </>
      )}
    </svg>
  )
}
