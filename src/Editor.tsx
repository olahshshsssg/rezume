import { useEffect, useState } from 'react'
import { SheetFrame } from './Sheet'
import {
  accentOf,
  editorNotes,
  monthLabel,
  proposeBullets,
  steps,
  templates,
  themes,
  uid,
  type Resume,
  type StepId,
} from './model'

type Pane = 'text' | 'sheet' | 'look'

export function Editor({
  resume,
  setResume,
  saved,
}: {
  resume: Resume
  setResume: (next: Resume | ((prev: Resume) => Resume)) => void
  saved: string
}) {
  const [step, setStep] = useState<StepId>('personal')
  const [openId, setOpenId] = useState(resume.experience[0]?.id ?? '')
  const [pane, setPane] = useState<Pane>('text')
  const [mobileSheet, setMobileSheet] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [format, setFormat] = useState<'desktop' | 'mobile' | 'png'>('desktop')
  const [skill, setSkill] = useState('')
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState<string[]>([])

  const stepIndex = steps.findIndex((item) => item.id === step)
  const patch = (partial: Partial<Resume>) => setResume((prev) => ({ ...prev, ...partial }))
  const showLook = step === 'look' || pane === 'look'

  useEffect(() => {
    if (step === 'look') setPane('look')
  }, [step])

  const go = (next: StepId) => {
    setStep(next)
    setPane(next === 'look' ? 'look' : 'text')
  }

  const edit = () => {
    const first = resume.experience[0]
    if (!first) return
    const bullets = proposeBullets(first.raw)
    setNotes(editorNotes(first.raw, bullets))
    setEditing(true)
    setResume((prev) => ({
      ...prev,
      summary: prev.summary || `${prev.position}. Опыт в ${first.company}: ${bullets[0]}.`,
      experience: prev.experience.map((item, index) => index === 0 ? { ...item, bullets, useAi: false } : item),
    }))
  }

  const accept = () => {
    setEditing(false)
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((item, index) => index === 0 ? { ...item, useAi: true } : item),
    }))
  }

  const keepMine = () => {
    setEditing(false)
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((item, index) => index === 0 ? { ...item, useAi: false, bullets: undefined } : item),
    }))
  }

  const addSkill = () => {
    const name = skill.trim()
    if (!name || resume.skills.includes(name) || resume.skills.length >= 30) return
    patch({ skills: [...resume.skills, name] })
    setSkill('')
  }

  const download = () => {
    setExportOpen(false)
    setMobileSheet(format !== 'desktop')
    setTimeout(() => window.print(), 250)
  }

  const status = (id: StepId) => {
    if (id === 'personal') return resume.fullName && resume.position ? '✓' : ''
    if (id === 'contacts') return resume.phone && resume.email ? '✓' : 'нужно заполнить'
    if (id === 'experience') return `${resume.noExperience ? resume.experience.length : resume.experience.length} запис.`
    if (id === 'education') return String(resume.education.length)
    if (id === 'skills') return String(resume.skills.length)
    return ''
  }

  return (
    <div className="editor">
      <aside className="toc">
        <div className="toc-label">Содержание</div>
        <hr className="toc-rule" />
        {steps.map((item, index) => (
          <button key={item.id} className={`toc-item ${step === item.id ? 'active' : ''}`} onClick={() => go(item.id)}>
            <span>{item.title}</span>
            <span className="toc-dots" />
            <span>{index + 1}</span>
            <span className={`toc-meta ${status(item.id) === 'нужно заполнить' ? 'warn' : ''}`}>{status(item.id)}</span>
          </button>
        ))}
      </aside>

      <section className={`form-col ${pane === 'sheet' ? 'pane-hidden' : ''}`}>
        {showLook ? (
          <Look resume={resume} patch={patch} />
        ) : (
          <>
            <h1 className="step-title">{steps[stepIndex].title}</h1>
            {step === 'personal' && (
              <>
                <label className="photo-input">
                  {resume.photo && <img src={resume.photo} alt="" />}
                  <span className="secondary" style={{ display: 'inline-grid', placeItems: 'center' }}>Загрузить фото</span>
                  <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    if (file.size > 5 * 1024 * 1024) return
                    const reader = new FileReader()
                    reader.onload = () => patch({ photo: String(reader.result) })
                    reader.readAsDataURL(file)
                  }} />
                </label>
                <Field label="Имя и фамилия" value={resume.fullName} onChange={(fullName) => patch({ fullName })} placeholder="Иван Петров" />
                <Field label="Желаемая должность" value={resume.position} onChange={(position) => patch({ position })} placeholder="Frontend-разработчик" />
                <Field label="Город" value={resume.city} onChange={(city) => patch({ city })} placeholder="Ташкент" />
                <Field label="Дата рождения" type="date" value={resume.birthDate} onChange={(birthDate) => patch({ birthDate })} />
                <label className="check"><input type="checkbox" checked={resume.hideBirthDate} onChange={(event) => patch({ hideBirthDate: event.target.checked })} /> Не показывать дату в резюме</label>
              </>
            )}
            {step === 'contacts' && (
              <>
                <Field label="Телефон" value={resume.phone} onChange={(phone) => patch({ phone })} placeholder="+998901112233" />
                <Field label="Почта" value={resume.email} onChange={(email) => patch({ email })} placeholder="name@example.com" />
                <Field label="Telegram" value={resume.telegram} onChange={(telegram) => patch({ telegram })} placeholder="@username" />
                <Field label="LinkedIn" value={resume.linkedin} onChange={(linkedin) => patch({ linkedin })} placeholder="https://linkedin.com/in/..." />
                <Field label="Сайт или GitHub" value={resume.website} onChange={(website) => patch({ website })} placeholder="https://" />
              </>
            )}
            {step === 'experience' && (
              <>
                <p className="hint">Пишите своими словами: что делали, что получилось. Цифры, если есть.</p>
                <label className="check"><input type="checkbox" checked={resume.noExperience} onChange={(event) => patch({ noExperience: event.target.checked })} /> Нет опыта работы</label>
                {resume.noExperience && <p className="margin-note">Опыта работы пока нет — расскажите об учебных проектах и стажировках.</p>}
                {resume.experience.map((item) => (
                  <article className="record" key={item.id}>
                    <button className="record-head" onClick={() => setOpenId(openId === item.id ? '' : item.id)}>
                      <span>
                        <h3>{item.role || 'Должность'} · {item.company || 'Компания'}</h3>
                        <div className="period">{item.start ? monthLabel(item.start) : 'дата'} — {item.end ? monthLabel(item.end) : 'по настоящее время'}</div>
                      </span>
                      <span>{openId === item.id ? 'Свернуть' : 'Открыть'}</span>
                    </button>
                    {openId === item.id && (
                      <div>
                        <Field label="Компания" value={item.company} onChange={(company) => updateExperience(setResume, item.id, { company })} placeholder="Saber Publisher" />
                        <Field label="Должность" value={item.role} onChange={(role) => updateExperience(setResume, item.id, { role })} placeholder="TeamLead" />
                        <Field label="Начало" type="month" value={item.start} onChange={(start) => updateExperience(setResume, item.id, { start })} />
                        <label className="check"><input type="checkbox" checked={item.end === null} onChange={(event) => updateExperience(setResume, item.id, { end: event.target.checked ? null : item.start })} /> По настоящее время</label>
                        {item.end !== null && <Field label="Окончание" type="month" value={item.end} onChange={(end) => updateExperience(setResume, item.id, { end })} />}
                        <label className="field">
                          <span>Чем занимались</span>
                          <textarea maxLength={1500} value={item.raw} onChange={(event) => updateExperience(setResume, item.id, { raw: event.target.value, useAi: false })} />
                        </label>
                        <div className="row-actions">
                          <button className="danger" onClick={() => patch({ experience: resume.experience.filter((entry) => entry.id !== item.id) })}>Удалить</button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
                <button className="text-btn" onClick={() => {
                  const id = uid('exp')
                  patch({ experience: [...resume.experience, { id, company: '', role: '', start: '2024-01', end: null, raw: '', useAi: false }] })
                  setOpenId(id)
                }}>Добавить место работы</button>
                <div className="edit-box">
                  <p className="margin-note">{resume.experience[0]?.raw ? 'Когда текст готов, редактор поможет его сформулировать.' : 'Когда заполните опыт, я помогу его сформулировать.'}</p>
                  <div className="cluster">
                    <button className="secondary" disabled={!resume.position || !resume.experience[0]?.raw} onClick={edit}>Отредактировать</button>
                  </div>
                  {editing && resume.experience[0] && (
                    <div className="correction">
                      <p className="struck">{resume.experience[0].raw}</p>
                      {(resume.experience[0].bullets ?? []).map((line) => <p className="inked" key={line}>{line}</p>)}
                      {notes.map((note) => <p className="margin-note" key={note}>{note}</p>)}
                      <div className="cluster">
                        <button className="primary" onClick={accept}>Принять</button>
                        <button className="secondary" onClick={keepMine}>Оставить мой текст</button>
                        <button className="text-btn" onClick={edit}>Ещё вариант</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {step === 'education' && (
              <>
                {resume.education.map((item) => (
                  <article className="record" key={item.id}>
                    <Field label="Учебное заведение" value={item.institution} onChange={(institution) => updateEducation(setResume, item.id, { institution })} />
                    <Field label="Специальность" value={item.specialty} onChange={(specialty) => updateEducation(setResume, item.id, { specialty })} />
                    <label className="field">
                      <span>Уровень</span>
                      <select value={item.level} onChange={(event) => updateEducation(setResume, item.id, { level: event.target.value })}>
                        {['Среднее', 'Среднее спец.', 'Бакалавр', 'Магистр', 'Курсы', 'Сертификат'].map((level) => <option key={level}>{level}</option>)}
                      </select>
                    </label>
                    <Field label="Год окончания" value={item.year} onChange={(year) => updateEducation(setResume, item.id, { year })} />
                    <button className="danger" onClick={() => patch({ education: resume.education.filter((entry) => entry.id !== item.id) })}>Удалить</button>
                  </article>
                ))}
                <button className="text-btn" onClick={() => patch({ education: [...resume.education, { id: uid('edu'), institution: '', specialty: '', level: 'Бакалавр', year: '2024' }] })}>Добавить образование</button>
              </>
            )}
            {step === 'skills' && (
              <>
                <p className="hint">Начните вводить навык, например React или Excel.</p>
                <div className="tags">
                  {resume.skills.map((item) => (
                    <button className="tag" key={item} onClick={() => patch({ skills: resume.skills.filter((skillName) => skillName !== item) })}>{item} ×</button>
                  ))}
                </div>
                <Field label="Навык" value={skill} onChange={setSkill} placeholder="TypeScript" onEnter={addSkill} />
                <button className="secondary" onClick={addSkill}>Добавить навык</button>
                <Field label="Языки" value={resume.languages} onChange={(languages) => patch({ languages })} placeholder="Русский — родной, английский — B2" />
              </>
            )}
            <div className="form-actions">
              <button className="secondary" disabled={stepIndex === 0} onClick={() => go(steps[stepIndex - 1].id)}>Назад</button>
              <button className="secondary" disabled={stepIndex === steps.length - 1} onClick={() => go(steps[stepIndex + 1].id)}>Далее</button>
            </div>
          </>
        )}
      </section>

      <section className={`desk ${pane === 'sheet' ? '' : 'pane-hidden'}`}>
        <div className={`stage ${pane !== 'sheet' && pane !== 'look' ? '' : ''}`}>
          <div className="save-state" style={{ alignSelf: 'flex-end' }}>{saved}</div>
          <SheetFrame resume={resume} mobile={mobileSheet} />
          <div className="view-switch">
            <button className={!mobileSheet ? 'active' : ''} onClick={() => setMobileSheet(false)}>Компьютер</button>
            <button className={mobileSheet ? 'active' : ''} onClick={() => setMobileSheet(true)}>Телефон</button>
          </div>
        </div>
      </section>

      <nav className="mobile-tabs">
        <button className={pane === 'text' ? 'active' : ''} onClick={() => { setPane('text'); if (step === 'look') setStep('personal') }}>Текст</button>
        <button className={pane === 'sheet' ? 'active' : ''} onClick={() => setPane('sheet')}>Лист</button>
        <button className={pane === 'look' ? 'active' : ''} onClick={() => { setPane('look'); setStep('look') }}>Вид</button>
      </nav>

      {exportOpen && (
        <div className="modal-back" onClick={() => setExportOpen(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h2>Скачать резюме</h2>
            <button className="choice" onClick={() => setFormat('desktop')}><span>Для компьютера</span><small>PDF · A4</small></button>
            <button className="choice" onClick={() => setFormat('mobile')}><span>Для телефона</span><small>PDF · 1 страница</small></button>
            <button className="choice" onClick={() => setFormat('png')}><span>Картинка</span><small>PNG · через печать</small></button>
            <p className="hint">Выбран вариант: {format === 'desktop' ? 'компьютер' : format === 'mobile' ? 'телефон' : 'картинка'}. Браузер откроет окно печати, там можно сохранить PDF.</p>
            <div className="modal-actions"><button className="primary" onClick={download}>Скачать</button></div>
          </div>
        </div>
      )}
      <button className="primary print-hide" style={{ position: 'fixed', top: 12, right: 188, zIndex: 4 }} onClick={() => setExportOpen(true)}>Скачать</button>
    </div>
  )
}

function Look({ resume, patch }: { resume: Resume; patch: (partial: Partial<Resume>) => void }) {
  return (
    <>
      <h1 className="step-title">Вид</h1>
      <div className="group-label">Шаблон</div>
      <div className="template-row">
        {templates.map((template) => (
          <button key={template.id} className={`template-pick ${resume.template === template.id ? 'selected' : ''}`} onClick={() => patch({ template: template.id })}>
            <div className="mini-sheet" style={{ borderTop: `4px solid ${accentOf({ ...resume, template: template.id })}` }}>
              <b>{resume.fullName || 'Имя'}</b>
              <i /><i /><i />
            </div>
            <strong>{template.name}</strong>
          </button>
        ))}
      </div>
      <div className="group-label">Цвет резюме</div>
      <div className="swatches">
        {themes.map((theme) => (
          <button key={theme.id} className={`swatch ${resume.themeId === theme.id ? 'selected' : ''}`} style={{ background: theme.accent }} aria-label={theme.name} onClick={() => patch({ themeId: theme.id })} />
        ))}
        <label className="swatch" style={{ background: resume.customAccent, borderStyle: 'dashed' }} aria-label="Свой цвет">
          <input hidden type="color" value={resume.customAccent} onChange={(event) => patch({ themeId: 'custom', customAccent: event.target.value })} />
        </label>
      </div>
    </>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', onEnter }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; onEnter?: () => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && onEnter) { event.preventDefault(); onEnter() } }} />
    </label>
  )
}

function updateExperience(setResume: (next: (prev: Resume) => Resume) => void, id: string, partial: Partial<Resume['experience'][number]>) {
  setResume((prev) => ({ ...prev, experience: prev.experience.map((item) => item.id === id ? { ...item, ...partial } : item) }))
}

function updateEducation(setResume: (next: (prev: Resume) => Resume) => void, id: string, partial: Partial<Resume['education'][number]>) {
  setResume((prev) => ({ ...prev, education: prev.education.map((item) => item.id === id ? { ...item, ...partial } : item) }))
}
