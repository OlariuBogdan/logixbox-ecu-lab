import { NavLink, Route, Routes } from 'react-router'
import HomePage from './pages/HomePage.jsx'
import TasksPage from './pages/TasksPage.jsx'
import AssistantPage from './pages/AssistantPage.jsx'
import './App.css'

// Structura comuna a tuturor paginilor: meniul de sus + pagina curenta
function App() {
  return (
    <>
      <header className="header">
        <span className="logo">IS + IA</span>
        <nav>
          <NavLink to="/" end>Acasa</NavLink>
          <NavLink to="/sarcini">Sarcini</NavLink>
          <NavLink to="/asistent">Asistent IA</NavLink>
        </nav>
      </header>

      <main className="container">
        {/* Fiecare adresa (URL) afiseaza o alta pagina */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sarcini" element={<TasksPage />} />
          <Route path="/asistent" element={<AssistantPage />} />
          <Route path="*" element={<p>Pagina nu exista.</p>} />
        </Routes>
      </main>
    </>
  )
}

export default App
