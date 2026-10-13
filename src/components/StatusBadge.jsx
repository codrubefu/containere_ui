import { useI18n } from '../i18n'

const STYLES = {
  neinceput: 'bg-base-700 text-muted border-base-600',
  in_lucru: 'bg-amber/15 text-amber border-amber/40',
  finalizat: 'bg-signal/15 text-signal border-signal/40',
}

export default function StatusBadge({ status, className = '' }) {
  const { t } = useI18n()
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${STYLES[status]} ${className}`}
    >
      {t(`status.${status}`)}
    </span>
  )
}
