import { type CSSProperties, type ReactNode } from 'react'
import { accentOf, monthLabel, type Resume } from './model'

function period(start: string, end: string | null) {
  return `${monthLabel(start)} — ${end ? monthLabel(end) : 'по настоящее время'}`
}

export function Sheet({ resume, mobile = false }: { resume: Resume; mobile?: boolean }) {
  const accent = accentOf(resume)
  const experience = resume.noExperience ? [] : resume.experience
  const contacts = [resume.city, resume.phone, resume.email, resume.telegram, resume.website].filter(Boolean)
  const birth = !resume.hideBirthDate && resume.birthDate ? resume.birthDate.split('-').reverse().join('.') : ''
  const oneColumn = mobile || resume.template === 'classic' || resume.template === 'minimal' || resume.template === 'ats'

  const blocks = {
    summary: resume.summary ? <p>{resume.summary}</p> : null,
    experience: experience.length ? (
      <section>
        <h2>Опыт</h2>
        {experience.map((item) => (
          <div className="job" key={item.id}>
            <div className="when">{period(item.start, item.end)}</div>
            <strong>{item.role}</strong>
            <div>{item.company}</div>
            {(item.useAi && item.bullets?.length ? item.bullets : item.raw ? [item.raw] : []).length > 0 && (
              <ul>
                {(item.useAi && item.bullets?.length ? item.bullets : [item.raw]).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    ) : null,
    education: resume.education.length ? (
      <section>
        <h2>Образование</h2>
        {resume.education.map((item) => (
          <div className="job" key={item.id}>
            <div className="when">{item.year}</div>
            <strong>{item.institution}</strong>
            <div>{item.specialty}, {item.level}</div>
          </div>
        ))}
      </section>
    ) : null,
    skills: resume.skills.length ? (
      <section>
        <h2>Навыки</h2>
        <div className="chips">{resume.skills.map((skill) => <span className="chip" key={skill}>{skill}</span>)}</div>
      </section>
    ) : null,
    languages: resume.languages ? (
      <section>
        <h2>Языки</h2>
        <p>{resume.languages}</p>
      </section>
    ) : null,
  }

  const head = (
    <header>
      {resume.photo && resume.template !== 'minimal' && resume.template !== 'ats' && (
        <img className={`photo ${resume.template === 'modern' ? 'round' : 'square'}`} src={resume.photo} alt="" />
      )}
      <h1>{resume.fullName || 'Имя'}</h1>
      <p className="role">{resume.position || 'Должность'}</p>
      <p className="contacts">{[birth, ...contacts].filter(Boolean).join(' · ')}</p>
    </header>
  )

  let body: ReactNode
  if (resume.template === 'modern' && !oneColumn) {
    body = (
      <div className="modern-grid">
        <aside className="modern-side">
          {head}
          {blocks.skills}
          {blocks.languages}
        </aside>
        <div className="modern-main">
          {blocks.summary}
          {blocks.experience}
          {blocks.education}
        </div>
      </div>
    )
  } else if (resume.template === 'creative') {
    body = (
      <>
        <div className="creative-head">{head}</div>
        <div className="creative-body">
          {blocks.summary}
          {blocks.experience}
          {blocks.education}
          {blocks.skills}
          {blocks.languages}
        </div>
      </>
    )
  } else {
    body = (
      <>
        {head}
        {blocks.summary}
        {blocks.experience}
        {blocks.education}
        {blocks.skills}
        {blocks.languages}
      </>
    )
  }

  return (
    <article className={`sheet sheet-${resume.template}`} style={{ '--accent': accent } as CSSProperties}>
      {body}
    </article>
  )
}

export function SheetFrame({ resume, mobile }: { resume: Resume; mobile: boolean }) {
  return (
    <div className={`sheet-frame ${mobile ? 'mobile' : ''}`}>
      <Sheet resume={resume} mobile={mobile} />
    </div>
  )
}
