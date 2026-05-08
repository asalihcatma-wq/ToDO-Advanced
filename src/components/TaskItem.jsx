import { Star, Sun, Calendar, FileText, Check } from 'lucide-react'

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (date.getTime() === today.getTime())     return 'Today'
  if (date.getTime() === tomorrow.getTime())  return 'Tomorrow'
  if (date.getTime() === yesterday.getTime()) return 'Yesterday'
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

export default function TaskItem({
  task, listColor, isSelected,
  onClick, onToggleComplete, onToggleImportant,
}) {
  const isOverdue = task.dueDate && !task.completed &&
    new Date(task.dueDate + 'T00:00:00') < new Date(new Date().toDateString())

  const completedSteps = task.steps?.filter(s => s.completed).length ?? 0
  const totalSteps     = task.steps?.length ?? 0

  return (
    <div
      className={`task-item${isSelected ? ' selected' : ''}${task.completed ? ' done' : ''}`}
      onClick={onClick}
    >
      <button
        className="task-check"
        style={task.completed
          ? { borderColor: listColor, backgroundColor: listColor }
          : {}}
        onClick={e => { e.stopPropagation(); onToggleComplete() }}
        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && <Check size={11} strokeWidth={3} />}
      </button>

      <div className="task-body">
        <span className="task-title">{task.title}</span>
        {(task.myDay || totalSteps > 0 || task.dueDate || task.notes) && (
          <div className="task-meta">
            {task.myDay && (
              <span className="meta-chip">
                <Sun size={10} /> My Day
              </span>
            )}
            {totalSteps > 0 && (
              <span className="meta-chip">
                {completedSteps}/{totalSteps}
              </span>
            )}
            {task.dueDate && (
              <span className={`meta-chip${isOverdue ? ' overdue' : ''}`}>
                <Calendar size={10} /> {formatDate(task.dueDate)}
              </span>
            )}
            {task.notes && (
              <span className="meta-chip"><FileText size={10} /></span>
            )}
          </div>
        )}
      </div>

      <button
        className={`task-star${task.important ? ' starred' : ''}`}
        onClick={e => { e.stopPropagation(); onToggleImportant() }}
        title={task.important ? 'Remove importance' : 'Mark as important'}
      >
        <Star
          size={16}
          fill={task.important ? '#e74856' : 'none'}
          color={task.important ? '#e74856' : 'currentColor'}
        />
      </button>
    </div>
  )
}
