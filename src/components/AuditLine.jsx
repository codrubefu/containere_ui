import { formatDateTime, useI18n } from '../i18n'

// „Adăugat de X · Modificat de Y” pentru un material din proiect.
export default function AuditLine({ item, className = '' }) {
  const { t, locale } = useI18n()
  if (!item.createdBy && !item.updatedBy) return null

  return (
    <p className={`text-[11px] text-muted ${className}`}>
      {item.createdBy && (
        <span>
          {t('audit.addedBy', { name: item.createdBy.name })} · {formatDateTime(item.createdAt, locale)}
        </span>
      )}
      {item.createdBy && item.updatedBy && <br />}
      {item.updatedBy && (
        <span>
          {t('audit.changedBy', { name: item.updatedBy.name })} · {formatDateTime(item.updatedAt, locale)}
        </span>
      )}
    </p>
  )
}
