import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ChevronLeft } from 'lucide-react'
import { USERS } from '../data/mockData'
import ThemeToggle from '../components/ThemeToggle'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { authApi } from '../api/client'

// Setat doar în dev (.env.development): API-ul acceptă acest cod fix doar cu APP_ENV=local.
const DEMO_SMS_CODE = import.meta.env.VITE_DEMO_SMS_CODE || ''

function errorKey(err, fallback) {
  if (err.status === 0) return 'login.network'
  if (err.status === 429) return 'login.tooMany'
  return fallback
}

export default function LoginScreen({ onLogin, theme, onToggleTheme }) {
  const [challenge, setChallenge] = useState(null) // { challenge_id, phone_masked, ... }

  return challenge ? (
    <SmsStep challenge={challenge} onBack={() => setChallenge(null)} onConfirmed={onLogin} />
  ) : (
    <CredentialsStep theme={theme} onToggleTheme={onToggleTheme} onValid={setChallenge} />
  )
}

function CredentialsStep({ onValid, theme, onToggleTheme }) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      onValid(await authApi.login(email.trim(), password))
    } catch (err) {
      setError(errorKey(err, 'login.invalid'))
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-base-950 md:items-center md:justify-center">
      <div className="safe-top safe-bottom flex w-full flex-1 flex-col px-5 pb-8 pt-10 md:flex-none md:w-full md:max-w-md md:flex-initial md:rounded-2xl md:border md:border-base-700 md:bg-base-900 md:px-8 md:py-10 md:shadow-2xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">{t('brand.full')}</p>
            <h1 className="mt-2 text-[26px] font-extrabold leading-tight text-paper">{t('login.title')}</h1>
            <p className="mt-1 text-sm text-muted">{t('login.subtitle')}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
            <LanguageSwitcher compact />
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-1 flex-col md:flex-none">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">{t('login.email')}</label>
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-base-600 bg-base-900 px-3 py-3 md:bg-base-950">
            <Mail size={17} className="shrink-0 text-muted" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.emailPlaceholder')}
              className="w-full bg-transparent text-[15px] text-paper outline-none placeholder:text-muted"
            />
          </div>

          <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{t('login.password')}</label>
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-base-600 bg-base-900 px-3 py-3 md:bg-base-950">
            <Lock size={17} className="shrink-0 text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-[15px] text-paper outline-none placeholder:text-muted"
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="tap shrink-0 text-muted" aria-label={t('login.showPassword')}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {error && <p className="mt-3 text-sm font-medium text-alert">{t(error)}</p>}

          <button
            type="submit"
            disabled={busy || !email.trim() || !password}
            className="tap mt-6 w-full rounded-lg bg-amber py-3.5 text-center text-[15px] font-bold text-ink disabled:opacity-40"
          >
            {t('login.continue')}
          </button>

          {DEMO_SMS_CODE && (
          <div className="mt-auto pt-6 md:mt-0 md:pt-6">
            <button
              type="button"
              onClick={() => setShowDemo((v) => !v)}
              className="tap text-xs font-semibold text-steel"
            >
              {showDemo ? t('login.hideDemo') : t('login.showDemo')}
            </button>
            {showDemo && (
              <div className="mt-3 space-y-2 rounded-lg border border-base-700 bg-base-900 p-3 md:bg-base-950">
                {USERS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setEmail(u.email)
                      setPassword(u.password)
                    }}
                    className="tap block w-full text-left"
                  >
                    <p className="text-xs font-semibold text-paper">{u.name} <span className="font-normal text-muted">— {t(`role.${u.role}`)}</span></p>
                    <p className="font-mono text-[11px] text-muted">{u.email} · {u.password}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          )}
        </form>
      </div>
    </div>
  )
}

function SmsStep({ challenge, onBack, onConfirmed }) {
  const { t } = useI18n()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [sentAgain, setSentAgain] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      onConfirmed(await authApi.verify(challenge.challenge_id, code))
    } catch (err) {
      // challenge_id invalid = cod expirat sau prea multe încercări → trebuie reluat loginul
      setError(errorKey(err, err.field === 'challenge_id' ? 'sms.expired' : 'sms.invalid'))
      setCode('')
      setBusy(false)
    }
  }

  async function resend() {
    setError('')
    try {
      await authApi.resend(challenge.challenge_id)
      setSentAgain(true)
    } catch (err) {
      setSentAgain(false)
      setError(err.status === 429 ? 'sms.resendWait' : errorKey(err, 'sms.expired'))
    }
  }

  return (
    <div className="flex min-h-screen bg-base-950 md:items-center md:justify-center">
      <div className="safe-top safe-bottom flex w-full flex-1 flex-col px-5 pb-8 pt-6 md:flex-none md:w-full md:max-w-md md:flex-initial md:rounded-2xl md:border md:border-base-700 md:bg-base-900 md:px-8 md:py-10 md:shadow-2xl">
        <button onClick={onBack} className="tap -ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-paper active:bg-base-800" aria-label={t('common.back')}>
          <ChevronLeft size={24} />
        </button>

        <div className="mt-6 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-base-800">
            <ShieldCheck size={22} className="text-amber" />
          </div>
          <h1 className="mt-4 text-[24px] font-extrabold leading-tight text-paper">{t('sms.title')}</h1>
          <p className="mt-1 text-sm text-muted">
            {t('sms.sentTo')} <span className="font-mono text-paper">{challenge.phone_masked}</span>.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-1 flex-col md:flex-none">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">{t('sms.codeLabel')}</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="mt-1 w-full rounded-lg border border-base-600 bg-base-900 px-3 py-3 text-center font-mono text-2xl font-bold tracking-[0.3em] text-paper outline-none focus:border-amber md:bg-base-950"
          />

          {DEMO_SMS_CODE && (
            <p className="mt-2 text-center text-xs text-muted">
              {t('sms.demoHint')} <span className="font-mono font-semibold text-amber">{DEMO_SMS_CODE}</span>
            </p>
          )}

          {error && <p className="mt-3 text-center text-sm font-medium text-alert">{t(error)}</p>}

          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="tap mt-6 w-full rounded-lg bg-amber py-3.5 text-center text-[15px] font-bold text-ink disabled:opacity-40"
          >
            {t('sms.confirm')}
          </button>

          <button
            type="button"
            onClick={resend}
            className="tap mt-4 text-center text-xs font-semibold text-steel"
          >
            {sentAgain ? t('sms.resent') : t('sms.resend')}
          </button>
        </form>
      </div>
    </div>
  )
}
