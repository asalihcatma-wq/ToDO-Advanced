import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight, Sun, Star, Calendar, ListTodo, List, AlignJustify, LayoutGrid, Check, FileText } from 'lucide-react'
import TaskItem from './TaskItem'
import UserMenu from './UserMenu'

const LIST_ICONS = { Sun, Star, Calendar, ListTodo, List }

const EMPTY_MESSAGES = {
  myday: 'Focus on your day',
  important: 'Try starring some tasks',
  planned: 'Try adding tasks with due dates',
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (date.getTime() === today.getTime())    return 'Today'
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow'
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

function GridTaskCard({ task, listColor, isSelected, onClick, onToggleComplete, onToggleImportant }) {
  const isOverdue = task.dueDate && !task.completed &&
    new Date(task.dueDate + 'T00:00:00') < new Date(new Date().toDateString())

  return (
    <div
      className={`grid-task-card${isSelected ? ' selected' : ''}${task.completed ? ' done' : ''}`}
      onClick={onClick}
    >
      <div className="grid-card-top">
        <button
          className="task-check"
          style={task.completed ? { borderColor: listColor, backgroundColor: listColor } : {}}
          onClick={e => { e.stopPropagation(); onToggleComplete() }}
        >
          {task.completed && <Check size={11} strokeWidth={3} />}
        </button>
        <button
          className={`task-star${task.important ? ' starred' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleImportant() }}
        >
          <Star
            size={15}
            fill={task.important ? '#e74856' : 'none'}
            color={task.important ? '#e74856' : 'currentColor'}
          />
        </button>
      </div>
      <span className={`grid-card-title${task.completed ? ' done' : ''}`}>{task.title}</span>
      <div className="grid-card-meta">
        {task.myDay && <span className="meta-chip"><Sun size={10} /> My Day</span>}
        {task.dueDate && (
          <span className={`meta-chip${isOverdue ? ' overdue' : ''}`}>
            <Calendar size={10} /> {formatDate(task.dueDate)}
          </span>
        )}
        {task.notes && <span className="meta-chip"><FileText size={10} /></span>}
      </div>
    </div>
  )
}

export default function TaskPanel({
  list, tasks, selectedTaskId,
  onSelectTask, onAddTask, onUpdateTask, searchQuery,
}) {
  const [newTitle, setNewTitle]     = useState('')
  const [showCompleted, setShowCompleted] = useState(false)
  const [viewMode, setViewMode]     = useState('list')

  const incomplete = tasks.filter(t => !t.completed)
  const completed  = tasks.filter(t => t.completed)

  const today   = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })

  function handleSubmit(e) {
    e.preventDefault()
    onAddTask(newTitle)
    setNewTitle('')
  }

  const emptyMsg = searchQuery
    ? 'No tasks match your search'
    : (EMPTY_MESSAGES[list?.id] || 'No tasks here yet')

  const Icon = LIST_ICONS[list?.icon] || List

  const taskItemProps = (task, onToggleComplete) => ({
    task,
    listColor: list?.color || '#818cf8',
    isSelected: selectedTaskId === task.id,
    onClick: () => onSelectTask(task.id),
    onToggleComplete,
    onToggleImportant: () => onUpdateTask(task.id, { important: !task.important }),
  })

  return (
    <main className="task-panel" data-list={list?.id} style={{ '--list-color': list?.color || '#818cf8' }}>

      <div className="panel-header">
        <div className="panel-title-row">
          <Icon size={22} color="#16a34a" strokeWidth={2} />
          <div>
            <h1 className="panel-title" style={{ color: '#16a34a' }}>{list?.name}</h1>
            {list?.id === 'myday' && (
              <p className="panel-subtitle">{dayName}, {dateStr}</p>
            )}
          </div>
        </div>

        <div className="panel-header-actions">
          <div className="view-toggle">
            <button
              className={`view-btn${viewMode === 'list' ? ' active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <AlignJustify size={15} />
            </button>
            <button
              className={`view-btn${viewMode === 'grid' ? ' active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
          <UserMenu />
        </div>
      </div>

      <div className="task-list-scroll" style={{ background: '#ffffff' }}>
        <form className="add-task-bar" onSubmit={handleSubmit}>
          <button type="submit" className="add-task-plus">
            <Plus size={18} />
          </button>
          <input
            className="add-task-input"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Add a task"
          />
        </form>

        {viewMode === 'list' ? (
          <>
            {incomplete.map(task => (
              <TaskItem
                key={task.id}
                {...taskItemProps(task, () => onUpdateTask(task.id, { completed: true }))}
              />
            ))}

            {incomplete.length === 0 && completed.length === 0 && (
              <div className="empty-state">{emptyMsg}</div>
            )}

            {completed.length > 0 && (
              <div className="completed-section">
                <button className="completed-toggle" onClick={() => setShowCompleted(v => !v)}>
                  {showCompleted ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  <span>Completed</span>
                  <span className="completed-count">{completed.length}</span>
                </button>
                {showCompleted && completed.map(task => (
                  <TaskItem
                    key={task.id}
                    {...taskItemProps(task, () => onUpdateTask(task.id, { completed: false }))}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {incomplete.length === 0 && completed.length === 0 && (
              <div className="empty-state">{emptyMsg}</div>
            )}

            <div className="task-grid">
              {incomplete.map(task => (
                <GridTaskCard
                  key={task.id}
                  {...taskItemProps(task, () => onUpdateTask(task.id, { completed: true }))}
                />
              ))}
            </div>

            {completed.length > 0 && (
              <div className="completed-section">
                <button className="completed-toggle" onClick={() => setShowCompleted(v => !v)}>
                  {showCompleted ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  <span>Completed</span>
                  <span className="completed-count">{completed.length}</span>
                </button>
                {showCompleted && (
                  <div className="task-grid">
                    {completed.map(task => (
                      <GridTaskCard
                        key={task.id}
                        {...taskItemProps(task, () => onUpdateTask(task.id, { completed: false }))}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
