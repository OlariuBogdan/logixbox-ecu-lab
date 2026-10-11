import { useEffect, useState } from 'react'
import { api } from '../api.js'

// Exemple de intrebari tehnice specifice laboratorului ECU
const EXAMPLES = [
  'Care sunt cauzele frecvente pe PCB pentru eroarea P0606 (Processor Fault) la un ECU Bosch EDC17?',
  'Cum verific pe banc cu osciloscopul transceiverul CAN-Bus daca modulul nu comunica cu testerul?',
  'Ce componente trebuie verificate pe placa la un scurtcircuit pe linia de 5V senzori?',
]

// Instructiunea de sistem: seteaza rolul de inginer electronist auto pentru Ollama
const SYSTEM_PROMPT = (
  'Esti un inginer electronist senior in cadrul laboratorului LOGIXBOX.RO, ' +
  'specializat in diagnosticarea si repararea la nivel de componenta SMD a modulelor auto (ECU, TCU, BCM). ' +
  'Raspunde tehnic, precis, structurat si concis, in limba romana.'
)

// Pagina Diagnoza IA: consultanta tehnica libera + generare checklist de verificare pe banc
function AssistantPage() {
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState(null)
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState(null)

  const [tasks, setTasks] = useState([])
  const [taskId, setTaskId] = useState('')
  const [subtasks, setSubtasks] = useState([])
  const [subtasksLoading, setSubtasksLoading] = useState(false)
  const [subtasksError, setSubtasksError] = useState(null)

  // Fisele ECU pentru lista de selectie
  useEffect(() => {
    api.getTasks()
      .then((data) => setTasks(data))
      .catch((err) => setSubtasksError(err.message))
  }, [])

  // POST /api/ai/chat
  async function ask(text) {
    if (!text.trim()) {
      return
    }
    setThinking(true)
    setError(null)
    setAnswer(null)
    try {
      const data = await api.chat(text, SYSTEM_PROMPT)
      setAnswer(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setThinking(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    ask(message)
  }

  function handleExample(text) {
    setMessage(text)
    ask(text)
  }

  // POST /api/ai/tasks/{id}/subtasks
  async function handleSubtasks() {
    setSubtasksLoading(true)
    setSubtasksError(null)
    setSubtasks([])
    try {
      const data = await api.suggestSubtasks(taskId)
      setSubtasks(data.subtasks)
    } catch (err) {
      setSubtasksError(err.message)
    } finally {
      setSubtasksLoading(false)
    }
  }

  return (
    <>
      <h1>Asistent Diagnoză Hardware & ECU (IA)</h1>
      <p className="subtitle">Consultanță tehnică la nivel de PCB, interpretare coduri DTC și proceduri de verificare pe banc generate local prin Ollama.</p>

      <section className="card">
        <h2>Consultanță Tehnică Rapidă (Coduri DTC / Depanare PCB)</h2>
        <form onSubmit={handleSubmit} className="chat-form">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Descrie codul DTC, tipul de ECU (ex: Bosch EDC17, Continental SIMOS, Delphi) sau simptomul măsurat pe placă..."
            rows={3}
            required
          />
          <button type="submit" disabled={thinking}>Solicită Diagnostic IA</button>
        </form>

        <div className="examples">
          {EXAMPLES.map((text) => (
            <button key={text} className="button-secondary" onClick={() => handleExample(text)} disabled={thinking}>
              {text}
            </button>
          ))}
        </div>

        {thinking && <p className="muted">Modelul analizează problema tehnică...</p>}

        {error && <div className="status status-error">{error}</div>}

        {answer && (
          <div className="answer">
            <p className="muted">Recomandare Tehnică ({answer.model}):</p>
            <p>{answer.answer}</p>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Generator Checklist de Diagnoză pe Banc</h2>
        <p className="muted">Selectează o fișă ECU din laborator, iar modelul IA va genera o procedură în 3–5 pași de verificare electronică și testare.</p>

        <div className="form">
          <select value={taskId} onChange={(event) => setTaskId(event.target.value)}>
            <option value="">Alege fișa modulului ECU</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>
          <button onClick={handleSubtasks} disabled={!taskId || subtasksLoading}>
            Generează Procedură Banc
          </button>
        </div>

        {subtasksLoading && <p className="muted">Se generează pașii de verificare hardware...</p>}

        {subtasksError && <div className="status status-error">{subtasksError}</div>}

        {subtasks.length > 0 && (
          <ol className="answer subtasks">
            {subtasks.map((subtask, index) => (
              <li key={index}>{subtask}</li>
            ))}
          </ol>
        )}
      </section>
    </>
  )
}

export default AssistantPage