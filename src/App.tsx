import { useEffect, useState } from 'react'
import { Editor } from './Editor'
import { Landing } from './Landing'
import { sample, type Resume } from './model'

type Theme = 'light' | 'dark'

function initialTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function loadResume(): Resume {
  try {
    const raw = localStorage.getItem('rezume-draft')
    if (!raw) return sample
    return { ...sample, ...JSON.parse(raw) }
  } catch {
    return sample
  }
}

export function App() {
  const [page, setPage] = useState<'home' | 'editor'>('home')
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [resume, setResume] = useState<Resume>(loadResume)
  const [saved, setSaved] = useState('Сохранено')
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    setSaved('Сохраняется…')
    const timer = window.setTimeout(() => {
      localStorage.setItem('rezume-draft', JSON.stringify(resume))
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      setSaved(`Сохранено в ${hh}:${mm}`)
    }, 400)
    return () => window.clearTimeout(timer)
  }, [resume])

  return (
    <>
      <header className="topbar">
        <button className="brand" onClick={() => setPage('home')}>Резюме</button>
        <div className="topbar-actions">
          {page === 'editor' && <span className="save-state">{saved}</span>}
          <button className="ghost" onClick={() => setLoginOpen(true)}>Войти</button>
          <button className="icon-btn" aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Свет' : 'Тьма'}
          </button>
        </div>
      </header>
      {page === 'home' ? (
        <Landing onStart={() => setPage('editor')} onLogin={() => setLoginOpen(true)} />
      ) : (
        <Editor resume={resume} setResume={setResume} saved={saved} />
      )}
      {loginOpen && (
        <div className="modal-back" onClick={() => setLoginOpen(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h2>Вход</h2>
            <p className="lede">Сервер ещё не подключён. Резюме можно собрать без входа, черновик останется на этом устройстве.</p>
            <div className="modal-actions"><button className="primary" onClick={() => setLoginOpen(false)}>Понятно</button></div>
          </div>
        </div>
      )}
    </>
  )
}
