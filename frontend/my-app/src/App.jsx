import { useEffect, useState } from 'react'
import './App.css'

const API_URL = '/api/todos'

function App() {
  const [todos, setTodos] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Could not load todos.')
      setTodos(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  const createTodo = async (event) => {
    event.preventDefault()
    const title = draft.trim()
    if (!title) return

    setError('')
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (!response.ok) throw new Error('Unable to add todo.')
      const created = await response.json()
      setTodos((current) => [...current, created])
      setDraft('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  const updateTodo = async (id, patch) => {
    setError('')
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!response.ok) throw new Error('Unable to update todo.')
      const updated = await response.json()
      setTodos((current) => current.map((todo) => (todo.id === id ? updated : todo)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  const toggleTodo = async (todo) => {
    await updateTodo(todo.id, { completed: !todo.completed })
  }

  const deleteTodo = async (id) => {
    setError('')
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Unable to delete todo.')
      setTodos((current) => current.filter((todo) => todo.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  return (
    <main className="todo-app">
      <div className="todo-card">
        <header className="todo-header">
          <h1>Todo List</h1>
          <p>Manage tasks quickly with FastAPI + React.</p>
        </header>

        <form className="todo-form" onSubmit={createTodo}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a new task"
            aria-label="New todo title"
          />
          <button type="submit">Add</button>
        </form>

        {error && <div className="todo-error">{error}</div>}
        {loading ? (
          <div className="todo-empty">Loading todos…</div>
        ) : todos.length === 0 ? (
          <div className="todo-empty">No tasks yet. Add one to get started.</div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <label className={todo.completed ? 'completed' : ''}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                  />
                  <span>{todo.title}</span>
                </label>
                <button type="button" onClick={() => deleteTodo(todo.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}

export default App
