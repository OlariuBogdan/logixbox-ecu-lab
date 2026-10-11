import { useEffect, useState } from 'react'
import { api, PRIORITIES, STATUSES } from '../api.js'

const emptyForm = { title: '', description: '', project_id: '', priority: '2' }

// Pagina Fise Service ECU: filtrare, receptie modul, schimbare status banc si diagnoza rapida IA
function TasksPage() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [filters, setFilters] = useState({ project_id: '', status: '' })
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aiAdvice, setAiAdvice] = useState(null)
  const [aiLoadingId, setAiLoadingId] = useState(null)

  // GET /api/tasks cu filtrele alese
  function loadTasks() {
    setLoading(true)
    api.getTasks(filters)
      .then((data) => {
        setTasks(data)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  // Loturile / Clientii sunt necesari pentru filtre si pentru formular
  useEffect(() => {
    api.getProjects()
      .then((data) => setProjects(data))
      .catch((err) => setError(err.message))
  }, [])

  // Lista se reincarca de fiecare data cand se schimba un filtru
  useEffect(() => {
    loadTasks()
  }, [filters])

  function projectName(id) {
    return projects.find((project) => project.id === id)?.name ?? `Client/Lot #${id}`
  }

  function handleFilterChange(event) {
    setFilters({ ...filters, [event.target.name]: event.target.value })
  }

  function handleFormChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  // POST /api/tasks
  async function handleSubmit(event) {
    event.preventDefault()
    try {
      await api.createTask({
        title: form.title,
        description: form.description || null,
        project_id: Number(form.project_id),
        priority: Number(form.priority),
      })
      setForm(emptyForm)
      loadTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  // PATCH /api/tasks/{id} - se trimite doar statusul nou
  async function handleStatusChange(task, status) {
    try {
      await api.updateTask(task.id, { status })
      loadTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  // POST /api/ai/tasks/{id}/explain - cere opinia rapida a AI-ului direct din tabel
  async function handleExplain(task) {
    setAiLoadingId(task.id)
    setError(null)
    try {
      const res = await api.explainTask(task.id)
      setAiAdvice({ title: task.title, answer: res.answer, model: res.model })
    } catch (err) {
      setError(err.message)
    } finally {
      setAiLoadingId(null)
    }
  }

  // DELETE /api/tasks/{id}, dupa confirmare
  async function handleDelete(task) {
    if (!window.confirm(`Ștergeți fișa ECU "${task.title}"?`)) {
      return
    }
    try {
      await api.deleteTask(task.id)
      loadTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <h1>Fișe Service & Diagnoză ECU</h1>
      <p className="subtitle">Gestiunea modulelor electronice auto (ECU / TCU / BCM) aflate pe bancul de probă.</p>

      {error && <div className="status status-error">{error}</div>}

      {aiAdvice && (
        <div className="answer">
          <strong>Recomandare Tehnică IA ({aiAdvice.model}) pentru: <code>{aiAdvice.title}</code></strong>
          <p>{aiAdvice.answer}</p>
          <button className="button-secondary" onClick={() => setAiAdvice(null)}>Închide</button>
        </div>
      )}

      <section className="card">
        <h2>Înregistrează Modul ECU în Service</h2>
        <form onSubmit={handleSubmit} className="form form-grid">
          <input
            name="title"
            value={form.title}
            onChange={handleFormChange}
            placeholder="Model ECU + Cod DTC (ex: Bosch EDC17C64 - P0606)"
            maxLength={200}
            required
          />
          <select name="project_id" value={form.project_id} onChange={handleFormChange} required>
            <option value="">Alege Clientul / Categoria</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <input
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Simptome / Măsurători (ex: Nu comunică pe CAN, scurt 5V)"
          />
          <select name="priority" value={form.priority} onChange={handleFormChange}>
            {Object.entries(PRIORITIES).map(([value, label]) => (
              <option key={value} value={value}>Regim: {label}</option>
            ))}
          </select>
          <button type="submit">Înregistrează Fișa ECU</button>
        </form>
      </section>

      <section className="card">
        <h2>Module Aflate în Laborator</h2>

        <div className="form filters">
          <select name="project_id" value={filters.project_id} onChange={handleFilterChange}>
            <option value="">Toți clienții / Toate loturile</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Toate stările de lucru</option>
            {Object.entries(STATUSES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {loading && <p className="muted">Se încarcă registrele din baza de date...</p>}

        {!loading && tasks.length === 0 && <p>Nu există module ECU pentru filtrele selectate.</p>}

        {!loading && tasks.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Modul ECU / Defect</th>
                <th>Client / Lot</th>
                <th>Urgență</th>
                <th>Stare pe Banc</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.title}</strong>
                    {task.description && <div className="muted" style={{ fontSize: '0.85rem', marginTop: '2px' }}>{task.description}</div>}
                  </td>
                  <td>{projectName(task.project_id)}</td>
                  <td><span className={`badge priority-${task.priority}`}>{PRIORITIES[task.priority]}</span></td>
                  <td>
                    <select value={task.status} onChange={(event) => handleStatusChange(task, event.target.value)}>
                      {Object.entries(STATUSES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => handleExplain(task)}
                      disabled={aiLoadingId === task.id}
                    >
                      {aiLoadingId === task.id ? 'Analiză...' : 'Analiză IA'}
                    </button>
                    <button className="button-danger" onClick={() => handleDelete(task)}>Șterge</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}

export default TasksPage