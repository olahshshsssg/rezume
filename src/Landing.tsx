export function Landing({ onStart, onLogin }: { onStart: () => void; onLogin: () => void }) {
  return (
    <main className="landing">
      <section className="hero">
        <div>
          <h1 className="display">Резюме, которое не стыдно отправить</h1>
          <p className="lede">Напишите о своём опыте как получится. Редактор переформулирует текст, а вы решите, что оставить.</p>
          <button className="primary" onClick={onStart}>Начать</button>
          <p className="note">Без регистрации. Регистрация нужна, только чтобы открыть резюме с другого устройства.</p>
        </div>
        <div className="fan" aria-hidden="true">
          <article className="fan-card">
            <div className="fan-kicker">Classic</div>
            <h2 className="fan-name">Иван Петров</h2>
            <p className="fan-role">Frontend-разработчик</p>
            <div className="fan-line" /><div className="fan-line short" /><div className="fan-line" />
          </article>
          <article className="fan-card">
            <div className="fan-kicker">Modern</div>
            <h2 className="fan-name">Иван Петров</h2>
            <p className="fan-role">Frontend-разработчик</p>
            <div className="fan-line short" /><div className="fan-line" /><div className="fan-line" />
          </article>
          <article className="fan-card">
            <div className="fan-kicker">ATS</div>
            <h2 className="fan-name">Иван Петров</h2>
            <p className="fan-role">Frontend-разработчик</p>
            <div className="fan-line" /><div className="fan-line" /><div className="fan-line short" />
          </article>
        </div>
      </section>
      <section className="how">
        <h2>Как это работает</h2>
        <div className="how-grid">
          <article>
            <div className="how-num">1</div>
            <h3>Вы пишете</h3>
            <p>Своими словами: компания, задача, результат.</p>
          </article>
          <article>
            <div className="how-num">2</div>
            <h3>Редактор правит</h3>
            <p>С объяснениями на полях. Каждый пункт можно оставить своим.</p>
            <p className="proof"><del>сделали сайт журнала на next</del><br /><ins>Перевёл сайт журнала на Next.js</ins></p>
          </article>
          <article>
            <div className="how-num">3</div>
            <h3>Вы скачиваете</h3>
            <p>PDF для компьютера и для телефона.</p>
          </article>
        </div>
      </section>
      <button className="text-btn" onClick={onLogin} style={{ marginTop: 32 }}>Войти</button>
    </main>
  )
}
