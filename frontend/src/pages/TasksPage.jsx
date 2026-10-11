import { useEffect, useState } from 'react'
import { api, PRIORITIES, STATUSES } from '../api.js'

const emptyForm = { title: '', description: '', project_id: '', priority: '2' }

// Pagina Fise Service ECU: filtrare, receptie modul, schimbare status banc, diagnoza IA si raport printabil PDF
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
      setAiAdvice({ taskId: task.id, title: task.title, answer: res.answer, model: res.model })
    } catch (err) {
      setError(err.message)
    } finally {
      setAiLoadingId(null)
    }
  }

  // Genereaza fisa A4 pentru imprimanta sau Save as PDF (pentru client)
  function handlePrintReport(task) {
    const client = projectName(task.project_id)
    const statusLabel = STATUSES[task.status] ?? task.status
    const priorityLabel = PRIORITIES[task.priority] ?? task.priority
    const dateStr = task.created_at
      ? new Date(task.created_at).toLocaleString('ro-RO')
      : new Date().toLocaleString('ro-RO')
    const currentAiNote = aiAdvice && aiAdvice.taskId === task.id ? aiAdvice.answer : null

    const printWindow = window.open('', '_blank', 'width=850,height=900')
    if (!printWindow) {
      alert('Permiteți deschiderea ferestrelor pop-up în browser pentru a genera PDF-ul.')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ro">
      <head>
        <meta charset="utf-8" />
        <title>Fisa_Service_ECU_${task.id}_LOGIXBOX</title>
        <style>
          body {
            font-family: 'Segoe UI', Roboto, Arial, sans-serif;
            color: #111827;
            background: #ffffff;
            margin: 32px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #ff5a00;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .brand {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 1px;
            color: #050505;
          }
          .brand span {
            color: #ff5a00;
          }
          .doc-info {
            text-align: right;
            font-size: 13px;
            color: #4b5563;
          }
          h1 {
            font-size: 20px;
            margin: 0 0 16px 0;
            text-transform: uppercase;
            color: #111827;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 20px;
          }
          .field-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: 700;
          }
          .field-value {
            font-size: 15px;
            font-weight: 600;
            color: #111827;
          }
          .section {
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 14px 16px;
            margin-bottom: 18px;
          }
          .section h3 {
            margin: 0 0 8px 0;
            font-size: 14px;
            text-transform: uppercase;
            color: #ff5a00;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
          }
          .notes-lines {
            min-height: 90px;
            border-bottom: 1px dashed #9ca3af;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 48px;
            padding-top: 16px;
            font-size: 14px;
          }
          .sig-box {
            width: 42%;
            border-top: 1px solid #374151;
            padding-top: 8px;
            text-align: center;
          }
          .footer {
            margin-top: 40px;
            font-size: 11px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
          }
          @media print {
            body { margin: 12mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">LOGIX<span>BOX</span>.RO</div>
            <div style="font-size: 13px; color: #4b5563;">Laborator Microelectronică Auto — Reparații & Diagnoză ECU / TCU / BCM</div>
          </div>
          <div class="doc-info">
            <div><strong>Fișă Service Nr.:</strong> #ECU-${task.id}</div>
            <div><strong>Data înregistrării:</strong> ${dateStr}</div>
          </div>
        </div>

        <h1>Raport Tehnic de Diagnoză pe Banc și Reparație</h1>

        <div class="grid">
          <div>
            <div class="field-label">Client / Service Partener / Lot</div>
            <div class="field-value">${client}</div>
          </div>
          <div>
            <div class="field-label">Stare Modul în Laborator</div>
            <div class="field-value">${statusLabel}</div>
          </div>
          <div>
            <div class="field-label">Modul Electronic & Cod DTC</div>
            <div class="field-value">${task.title}</div>
          </div>
          <div>
            <div class="field-label">Regim de Lucru</div>
            <div class="field-value">${priorityLabel}</div>
          </div>
        </div>

        <div class="section">
          <h3>1. Simptome Raportate / Măsurători la Recepție</h3>
          <p style="margin: 0;">${task.description || 'Nu au fost specificate detalii suplimentare la recepție.'}</p>
        </div>

        ${currentAiNote ? `
        <div class="section">
          <h3>2. Notă Tehnică & Componente Suspecte (Asistent Diagnoză IA)</h3>
          <p style="margin: 0; white-space: pre-wrap;">${currentAiNote}</p>
        </div>
        ` : ''}

        <div class="section">
          <h3>${currentAiNote ? '3.' : '2.'} Intervenții Efectuate pe PCB / Rezultat Testare pe Banc</h3>
          <div class="notes-lines"></div>
        </div>

        <div class="section">
          <h3>Recomandări la Montajul pe Vehicul & Condiții de Garanție</h3>
          <p style="margin: 0; font-size: 12.5px; color: #374151;">
            Înainte de conectarea modulului reparat pe vehicul, verificați obligatoriu integritatea cablajului, tensiunea de încărcare a alternatorului (max. 14.6V), masele de putere și absența scurtcircuitelor pe actuatori (injectoare, bobine, supape). Garanția acoperă exclusiv intervenția efectuată în laborator și se anulează în caz de infiltrații de lichide, șocuri electrice (inversare polaritate / robot pornire) sau desigilarea carcasei.
          </p>
        </div>

        <div class="signatures">
          <div class="sig-box">
            <strong>Inginer Electronist (LOGIXBOX.RO)</strong><br/>
            Semnătură & Ștampilă
          </div>
          <div class="sig-box">
            <strong>Beneficiar / Service Partener</strong><br/>
            Recepție modul
          </div>
        </div>

        <div class="footer">
          Document generat prin platforma internă LOGIXBOX.RO — ECU Repair & AI Diagnostics Lab
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
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
                  <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => handleExplain(task)}
                      disabled={aiLoadingId === task.id}
                    >
                      {aiLoadingId === task.id ? 'Analiză...' : 'Analiză IA'}
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => handlePrintReport(task)}
                    >
                      Print / PDF
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