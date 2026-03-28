import { useState } from 'react';
import { FiCheckSquare, FiSquare, FiTrash2, FiPlus } from 'react-icons/fi';

function TodoListWidget({ todos, setTodos, isDarkMode }) {
  const [newTodo, setNewTodo] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([{ id: Date.now(), text: newTodo, completed: false }, ...todos]);
    setNewTodo('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div style={{ 
      backgroundColor: isDarkMode ? '#1f2937' : 'white', 
      padding: '20px', 
      borderRadius: '16px', 
      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, 
      boxShadow: isDarkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 10px 15px -3px rgba(0,0,0,0.05)',
      position: 'sticky', // Віджет буде їздити за нами при скролі
      top: '20px'
    }}>
      <h2 style={{ fontSize: '18px', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px', color: isDarkMode ? '#f3f4f6' : '#1f2937', fontWeight: 'bold' }}>
        <div style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '6px', borderRadius: '8px', display: 'flex' }}>
          <FiCheckSquare size={18} />
        </div>
        Мої задачі
      </h2>
      
      {/* Сучасне поле вводу з кнопкою всередині */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', marginBottom: '20px', position: 'relative' }}>
        <input 
          type="text" 
          value={newTodo} 
          onChange={(e) => setNewTodo(e.target.value)} 
          placeholder="Що плануємо?" 
          style={{ 
            flex: 1, padding: '12px 40px 12px 15px', borderRadius: '10px', 
            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, 
            background: isDarkMode ? '#374151' : '#f9fafb', 
            color: isDarkMode ? 'white' : 'black', fontSize: '14px', outline: 'none'
          }} 
        />
        <button 
          type="submit" 
          title="Додати задачу"
          style={{ 
            position: 'absolute', right: '5px', top: '5px', bottom: '5px', width: '32px',
            backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <FiPlus size={18} />
        </button>
      </form>

      <div className="todo-list-container" style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
        {todos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>Список порожній.</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>Час відпочити або додати нову задачу!</p>
          </div>
        ) : null}
        
        {todos.map(todo => (
          <div key={todo.id} className="todo-item" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px', backgroundColor: isDarkMode ? '#374151' : '#f9fafb', borderRadius: '10px', border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', flex: 1 }} onClick={() => toggleTodo(todo.id)}>
              <div style={{ marginTop: '2px' }}>
                {todo.completed ? <FiCheckSquare size={18} color="#10b981" /> : <FiSquare size={18} color={isDarkMode ? '#6b7280' : '#9ca3af'} />}
              </div>
              <span style={{ textDecoration: todo.completed ? 'line-through' : 'none', color: todo.completed ? '#9ca3af' : (isDarkMode ? '#f3f4f6' : '#1f2937'), fontSize: '14px', lineHeight: '1.4', opacity: todo.completed ? 0.6 : 1, transition: '0.2s' }}>
                {todo.text}
              </span>
            </div>
            <button onClick={() => deleteTodo(todo.id)} className="todo-delete-btn" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }}>
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TodoListWidget;