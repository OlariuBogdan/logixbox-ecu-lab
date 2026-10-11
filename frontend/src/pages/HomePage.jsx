import { useEffect, useState } from 'react'
import { api } from '../api.js'

// Pagina de start: Panou de Control Laborator ECU + Gestiune Clienti/Loturi
function HomePage() {
  const [health, setHealth] = useState(null)
  const [healthError, setHealthError] = useState(null)
  const [ai, setAi] = useState(null)
  const [aiError, setAiError] = useState(null)

  const [projects, setProjects] = useState([])
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [projectMsg, setProjectMsg] = useState(null)

  function loadProjects() {
    api.getProjects()
      .then((data) => setProjects(data))
      .catch(() => {})
  }

  useEffect(() => {
    api.getHealth()
      .then((data) => setHealth(data))
      .catch((err) => setHealthError(err.message))

    api.getAiStatus()
      .then((data) => setAi(data))
      .catch((err) => setAiError(err.message))

    loadProjects()
  }, [])

  async function handleCreateProject(event) {
    event.preventDefault()
    setProjectMsg(null)
    try {
      await api.createProject({
        name: newProject.name,
        description: newProject.description || null,
      })
      setNewProject({ name: '', description: '' })
      setProjectMsg({ type: 'ok', text: 'Clientul / Lotul a fost înregistrat cu succes.' })
      loadProjects()
    } catch (err) {
      setProjectMsg({ type: 'error', text: err.message })
    }
  }

  // Ollama ruleaza si modelul ales este descarcat
  const modelReady = ai?.ollama === 'disponibil' &&
    (ai.models.includes(ai.model) || ai.models.includes(`${ai.model}:latest`))

  return (
    <>
      <h1>LOGIXBOX.RO — Panou Control Laborator</h1>
      <p className="subtitle">Sistem integrat pentru gestiunea reparațiilor electronice auto (ECU / TCU / BCM) și diagnoză asistată de IA</p>

      <section className="card">
        <h2>Stare Server & Bază de Date Registre</h2>
        <p>Endpoint telemetrie: <code>GET {api.url}/api/health</code></p>

        {!health && !healthError && <p className="muted">Se verifică conexiunea cu baza de date...</p>}

        {healthError && (
          <div className="status status-error">
            <strong>Backend-ul nu răspunde.</strong>
            <p>{healthError}</p>
            <p>Porniți containerele din folderul principal rulând: <code>docker compose up -d</code>.</p>
          </div>
        )}

        {health && (
          <div className="status status-ok">
            <p><strong>Stare API:</strong> {health.message}</p>
            <p><strong>Bază de date PostgreSQL:</strong> {health.database}</p>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Motorul de Diagnoză IA (Ollama Local)</h2>
        <p>Endpoint verificare: <code>GET {api.url}/api/ai/status</code></p>

        {!ai && !aiError && <p className="muted">Se interoghează serviciul Ollama...</p>}

        {aiError && <div className="status status-error">{aiError}</div>}

        {ai && (
          <div className={`status ${modelReady ? 'status-ok' : 'status-error'}`}>
            <p><strong>Serviciu Ollama:</strong> {ai.ollama}</p>
            <p><strong>Model activ:</strong> <code>{ai.model}</code></p>
            {ai.models.length > 0 && <p><strong>Modele disponibile local:</strong> {ai.models.join(', ')}</p>}
            <p>{ai.detalii}</p>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Parteneri Service & Loturi Module ({projects.length})</h2>
        <p className="muted">Înregistrează un service partener sau o categorie nouă de module (de ex. „Service Auto Bacău - VAG”, „Recondiționare TCU DSG”).</p>

        {projectMsg && (
          <div className={`status ${projectMsg.type === 'ok' ? 'status-ok' : 'status-error'}`}>
            {projectMsg.text}
          </div>
        )}

        <form onSubmit={handleCreateProject} className="form" style={{ marginBottom: '16px' }}>
          <input
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="Nume Client / Service Partener / Lot"
            maxLength={100}
            required
          />
          <input
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            placeholder="Detalii (telefon, CUI, observații)"
          />
          <button type="submit">Adaugă Client / Lot</button>
        </form>

        {projects.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Client / Lot</th>
                <th>Detalii</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td><code>#{p.id}</code></td>
                  <td><strong>{p.name}</strong></td>
                  <td className="muted">{p.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <h2>Resurse Tehnice & API</h2>
        <ul>
          <li>
            Documentația interactivă API (Swagger):{' '}
            <a href={`${api.url}/docs`} target="_blank" rel="noreferrer">{api.url}/docs</a>
          </li>
          <li>
            Biblioteca de modele Ollama:{' '}
            <a href="https://ollama.com/library" target="_blank" rel="noreferrer">ollama.com/library</a>
          </li>
        </ul>
      </section>
    </>
  )
}

export default HomePage