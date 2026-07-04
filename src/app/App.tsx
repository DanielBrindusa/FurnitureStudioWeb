import './app.css'

const foundationItems = [
  'Integer-millimetre design model',
  'Rule-driven validation and pricing',
  'Local projects with JSON and CSV export',
]

export function App() {
  return (
    <main className="foundation-shell">
      <nav className="topbar" aria-label="Project">
        <a className="brand" href="#top" aria-label="FurnitureStudioWeb home">
          <span className="brand-mark" aria-hidden="true">
            FSW
          </span>
          <span>FurnitureStudioWeb</span>
        </a>
        <span className="status-pill">Foundation ready</span>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Custom furniture, precisely planned</p>
          <h1>Build the cabinet.<br />Understand every part.</h1>
          <p className="lede">
            An original browser-based workspace for designing wardrobes and
            cabinets—not rooms. The product engine and interactive builder are
            the next implementation phase.
          </p>

          <ul className="foundation-list" aria-label="Planned foundation">
            {foundationItems.map((item, index) => (
              <li key={item}>
                <span aria-hidden="true">0{index + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="cabinet-study" aria-label="Abstract cabinet construction study">
          <div className="dimension dimension-width">1200 mm</div>
          <div className="dimension dimension-height">2400 mm</div>
          <div className="cabinet-frame">
            <div className="cabinet-bay cabinet-bay-wide">
              <div className="rail" />
              <div className="shelf shelf-high" />
              <div className="shelf shelf-low" />
            </div>
            <div className="cabinet-bay">
              <div className="drawer" />
              <div className="drawer" />
              <div className="drawer" />
              <div className="handle" />
            </div>
          </div>
          <div className="study-note">
            <span>Front elevation</span>
            <strong>Concept 01</strong>
          </div>
        </div>
      </section>
    </main>
  )
}
