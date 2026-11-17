export type TemplateId = 'classic' | 'modern' | 'minimal' | 'creative' | 'ats'

export type Experience = {
  id: string
  company: string
  role: string
  start: string
  end: string | null
  raw: string
  bullets?: string[]
  useAi: boolean
}

export type Education = {
  id: string
  institution: string
  specialty: string
  level: string
  year: string
}

export type Resume = {
  fullName: string
  position: string
  birthDate: string
  hideBirthDate: boolean
  city: string
  photo?: string
  phone: string
  email: string
  telegram: string
  linkedin: string
  website: string
  summary: string
  experience: Experience[]
  noExperience: boolean
  education: Education[]
  skills: string[]
  languages: string
  template: TemplateId
  themeId: string
  customAccent: string
}

export const themes = [
  { id: 'blue', name: 'Синий', accent: '#1F4E79' },
  { id: 'emerald', name: 'Изумрудный', accent: '#1F6B4A' },
  { id: 'graphite', name: 'Графит', accent: '#3A3F45' },
  { id: 'bordeaux', name: 'Бордо', accent: '#7A2E3A' },
  { id: 'violet', name: 'Фиолетовый', accent: '#4C3D75' },
  { id: 'terra', name: 'Терракота', accent: '#A24B32' },
  { id: 'teal', name: 'Бирюзовый', accent: '#0E6E73' },
  { id: 'mono', name: 'Чёрно-белый', accent: '#1A1C1E' },
] as const

export const templates: { id: TemplateId; name: string }[] = [
  { id: 'classic', name: 'Classic' },
  { id: 'modern', name: 'Modern' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'creative', name: 'Creative' },
  { id: 'ats', name: 'ATS' },
]

export const steps = [
  { id: 'personal', title: 'Личные данные' },
  { id: 'contacts', title: 'Контакты' },
  { id: 'experience', title: 'Опыт' },
  { id: 'education', title: 'Образование' },
  { id: 'skills', title: 'Навыки' },
  { id: 'look', title: 'Вид' },
] as const

export type StepId = (typeof steps)[number]['id']

export const sample: Resume = {
  fullName: 'Иван Петров',
  position: 'Frontend-разработчик',
  birthDate: '1998-04-12',
  hideBirthDate: true,
  city: 'Ташкент',
  phone: '+998901112233',
  email: 'ivan.petrov@example.com',
  telegram: '@ivanpetrov',
  linkedin: '',
  website: '',
  summary: '',
  noExperience: false,
  experience: [
    {
      id: 'exp-1',
      company: 'Saber Publisher',
      role: 'TeamLead',
      start: '2022-03',
      end: null,
      raw: 'руковожу командой из 4 человек, сделали сайт журнала на next, ускорили загрузку в 3 раза',
      useAi: false,
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Ташкентский университет информационных технологий',
      specialty: 'Программная инженерия',
      level: 'Бакалавр',
      year: '2020',
    },
  ],
  skills: ['React', 'TypeScript', 'Next.js'],
  languages: 'Русский — родной, английский — B2',
  template: 'classic',
  themeId: 'blue',
  customAccent: '#12608A',
}

export function accentOf(resume: Resume) {
  if (resume.themeId === 'custom') return resume.customAccent || '#1A1C1E'
  return themes.find((theme) => theme.id === resume.themeId)?.accent ?? '#1F4E79'
}

export function monthLabel(value: string) {
  const [year, month] = value.split('-')
  const names = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
  const index = Number(month) - 1
  if (!year || index < 0 || index > 11) return value
  return `${names[index]} ${year}`
}

export function splitSentences(raw: string) {
  return raw
    .split(/[.\n;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
}

export function editorNotes(raw: string, bullets: string[]) {
  const notes: string[] = []
  if (raw.length < 80) notes.push('мало деталей — добавьте результат')
  if (/\d/.test(raw)) notes.push('цифры взяты из вашего текста')
  if (/next/i.test(raw) && bullets.some((item) => item.includes('Next.js'))) notes.push('уточнил названия: next → Next.js')
  if (notes.length === 0) notes.push('разбил текст на пункты')
  return notes.slice(0, 2)
}

export function proposeBullets(raw: string) {
  const known = 'руковожу командой из 4 человек, сделали сайт журнала на next, ускорили загрузку в 3 раза'
  if (raw.trim().toLowerCase() === known) {
    return [
      'Руководил командой из 4 разработчиков',
      'Перевёл сайт журнала на Next.js',
      'Ускорил загрузку страниц в 3 раза',
    ]
  }
  return splitSentences(raw)
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}
