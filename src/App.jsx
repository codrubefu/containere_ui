import { useEffect, useState } from 'react'
import { LayoutGrid, Factory, UserCircle2, Loader2, X } from 'lucide-react'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import ThemeToggle from './components/ThemeToggle'
import LanguageSwitcher from './components/LanguageSwitcher'
import { useI18n } from './i18n'
import { authApi, getToken, setToken } from './api/client'
import { projectsApi } from './api/projects'
import { accessFor, normalizeUser } from './auth/permissions'
import LoginScreen from './screens/LoginScreen'
import AdminHome from './screens/AdminHome'
import ProjectDetail from './screens/ProjectDetail'
import WorkerHome from './screens/WorkerHome'
import ProjectPicker from './screens/ProjectPicker'
import SectionWork from './screens/SectionWork'

export default function App() {
  const { t } = useI18n()
  const [user, setUser] = useState(null)
  const [restoring, setRestoring] = useState(() => Boolean(getToken()))
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState(null)
  const [openProjectId, setOpenProjectId] = useState(null)
  const [openSectionId, setOpenSectionId] = useState(null)
  const [openWorkProjectId, setOpenWorkProjectId] = useState(null)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  // Sesiune salvată: tokenul din localStorage e validat prin /auth/me.
  useEffect(() => {
    if (!restoring) return
    authApi
      .me()
      .then((res) => setUser(normalizeUser(res.data ?? res)))
      .catch(() => setToken(null))
      .finally(() => setRestoring(false))
  }, [restoring])

  function handleLogin({ token, user: apiUser }) {
    setToken(token)
    setUser(normalizeUser(apiUser))
    setTab(null)
  }

  async function handleLogout() {
    try {
      await authApi.logout()
    } catch {
      // tokenul poate fi deja expirat/revocat — ieșim oricum local
    }
    setToken(null)
    setUser(null)
    setTab(null)
    setOpenProjectId(null)
    setOpenSectionId(null)
    setOpenWorkProjectId(null)
  }

  // contract = răspunsul /api/contracts/{id}; păstrăm doar ce afișăm.
  // Lista completă de proiecte e doar pentru cine vede tabul Proiecte; secțiile au API-ul lor (/work).
  function loadProjects() {
    setProjectsLoading(true)
    projectsApi
      .list()
      .then(setProjects)
      .catch(showError)
      .finally(() => setProjectsLoading(false))
  }

  useEffect(() => {
    if (user && accessFor(user).projects.visible) loadProjects()
    else setProjects([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function showError(err) {
    const fieldMessage = Object.values(err?.body?.errors ?? {})[0]?.[0]
    setError(fieldMessage || (err?.status === 0 ? t('login.network') : t('common.saveError')))
  }

  // Fiecare apel întoarce proiectul complet; îl înlocuim (sau îl adăugăm primul, dacă e nou).
  async function save(request) {
    try {
      const updated = await request
      setProjects((prev) =>
        prev.some((p) => p.id === updated.id) ? prev.map((p) => (p.id === updated.id ? updated : p)) : [updated, ...prev]
      )
    } catch (err) {
      showError(err)
    }
  }

  function createProject({ contract, name, deadline }) {
    save(projectsApi.create({ contractId: contract.id, name, deadline }))
  }

  function addItemToProject(projectId, payload) {
    save(projectsApi.addItems(projectId, payload))
  }

  function removeItemFromProject(projectId, itemId) {
    save(projectsApi.removeItem(itemId))
  }

  // workerId îl stabilește serverul (utilizatorul curent).
  function updateItem(itemId, updates) {
    save(projectsApi.updateItem(itemId, { status: updates.status, actualQty: updates.actualQty }))
  }

  function addComment(itemId, text) {
    if (!text.trim()) return
    save(projectsApi.addComment(itemId, text.trim()))
  }

  function toggleProjectClosed(projectId) {
    const project = projects.find((p) => p.id === projectId)
    save(project.status === 'finalizat' ? projectsApi.reopen(projectId) : projectsApi.close(projectId))
  }

  if (restoring) return <div className="min-h-screen bg-base-950" />
  if (!user) return <LoginScreen onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />

  const access = accessFor(user)
  const openProject = projects.find((p) => p.id === openProjectId)

  const navItems = [
    access.projects.visible && { key: 'projects', label: t('nav.projects'), icon: LayoutGrid },
    access.sections.visible && { key: 'sections', label: t('nav.sections'), icon: Factory },
    { key: 'account', label: t('nav.account'), icon: UserCircle2 },
  ].filter(Boolean)
  const activeTab = navItems.some((i) => i.key === tab) ? tab : navItems[0].key

  function selectTab(key) {
    setOpenProjectId(null)
    setOpenSectionId(null)
    setOpenWorkProjectId(null)
    setTab(key)
    // reîncărcare, ca să apară ce s-a lucrat între timp pe secții
    if (key === 'projects' && key !== activeTab) loadProjects()
  }

  let content
  if (projectsLoading && activeTab === 'projects' && projects.length === 0) {
    content = (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={26} className="animate-spin text-muted" />
      </div>
    )
  } else if (activeTab === 'account') {
    content = <AccountScreen user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
  } else if (activeTab === 'projects') {
    content = openProject ? (
      <ProjectDetail
        project={openProject}
        access={access.projects}
        onBack={() => setOpenProjectId(null)}
        onAddItem={(payload) => addItemToProject(openProject.id, payload)}
        onRemoveItem={(itemId) => removeItemFromProject(openProject.id, itemId)}
        onUpdateItem={updateItem}
        onAddComment={addComment}
        onToggleClose={() => toggleProjectClosed(openProject.id)}
      />
    ) : (
      <AdminHome
        projects={projects}
        canCreate={access.projects.create}
        onOpenProject={setOpenProjectId}
        onCreateProject={createProject}
      />
    )
  } else if (openSectionId && openWorkProjectId) {
    content = (
      <SectionWork
        sectionId={openSectionId}
        projectId={openWorkProjectId}
        user={user}
        access={access.sections}
        onBack={() => setOpenWorkProjectId(null)}
        onError={showError}
      />
    )
  } else if (openSectionId) {
    content = (
      <ProjectPicker
        sectionId={openSectionId}
        onSelectProject={setOpenWorkProjectId}
        onBack={() => setOpenSectionId(null)}
      />
    )
  } else {
    content = <WorkerHome onOpenSection={setOpenSectionId} />
  }

  return (
    <div className="min-h-screen bg-base-950 md:flex">
      <Sidebar
        user={user}
        items={navItems}
        active={activeTab}
        onSelect={selectTab}
        onLogout={handleLogout}
        roleLabel={t(`role.${user.role}`)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 md:pl-60">
        <div className="mx-auto max-w-md md:max-w-4xl md:px-8 md:py-6">{content}</div>
      </div>

      <BottomNav items={navItems} active={activeTab} onSelect={selectTab} />

      {error && (
        <div className="fixed inset-x-3 bottom-24 z-40 flex items-start gap-2 rounded-xl border border-alert/40 bg-base-900 px-3.5 py-3 shadow-lg shadow-black/40 md:bottom-8 md:left-auto md:right-8 md:max-w-sm">
          <p className="flex-1 text-sm text-alert">{error}</p>
          <button onClick={() => setError(null)} className="tap shrink-0 text-muted" aria-label={t('common.close')}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

function AccountScreen({ user, onLogout, theme, onToggleTheme }) {
  const { t } = useI18n()
  return (
    <div className="flex min-h-screen flex-col bg-base-950 pb-24 md:pb-8">
      <div className="safe-top px-5 pt-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-base-800">
          <UserCircle2 size={34} className="text-amber" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-paper">{user.name}</h1>
        <p className="text-sm text-muted">{t(`role.${user.role}`)}</p>
      </div>

      <div className="mt-6 px-5 md:hidden">
        <div className="rounded-xl border border-base-700 bg-base-900 p-1.5">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <div className="mt-1 border-t border-base-700 pt-1.5">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 px-5 md:hidden">
        <button
          onClick={onLogout}
          className="tap flex w-full items-center justify-center gap-2 rounded-xl border border-alert/40 bg-alert/10 py-3.5 text-[15px] font-semibold text-alert"
        >
          {t('common.logout')}
        </button>
      </div>
    </div>
  )
}
