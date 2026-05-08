import { useState, useEffect, useRef } from 'react'
import { X, Sun, Calendar, Star, Trash2, Plus, Check, FileText } from 'lucide-react'

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (date.getTime() === today.getTime())     return 'Today'
  if (date.getTime() === tomorrow.getTime())  return 'Tomorrow'
  if (date.getTime() === yesterday.getTime()) return 'Yesterday'
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
}

export default function TaskDetail({ task, listColor, onUpdate, onDelete, onClose }) {
  const [title, setTitle]   = useState(task.title)
  const [notes, setNotes]   = useState(task.notes || '')
  const [newStep, setNewStep] = useState('')
  const titleRef = useRef(null)
  const dateRef  = useRef(null)

  function openDatePicker(e) {
    if (e.target.closest('.action-remove')) return
    try { dateRef.current?.showPicker() } catch { dateRef.current?.click() }
  }

  useEffect(() => {
    setTitle(task.title)
    setNotes(task.notes || '')
  }, [task.id])

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto'
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px'
    }
  }, [title])

  function handleTitleBlur() {
    const trimmed = title.trim()
    if (trimmed && trimmed !== task.title) onUpdate({ title: trimmed })
    else if (!trimmed) setTitle(task.title)
  }

  function handleNotesBlur() {
    if (notes !== task.notes) onUpdate({ notes })
  }

  function addStep() {
    if (!newStep.trim()) return
    const step = { id: crypto.randomUUID(), title: newStep.trim(), completed: false }
    onUpdate({ steps: [...task.steps, step] })
    setNewStep('')
  }

  function toggleStep(id) {
    onUpdate({ steps: task.steps.map(s => s.id === id ? { ...s, completed: !s.completed } : s) })
  }

  function deleteStep(id) {
    onUpdate({ steps: task.steps.filter(s => s.id !== id) })
  }

  const today = new Date().toISOString().split('T')[0]
  const createdDate = new Date(task.createdAt).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short',
  })

  return (
    <aside className="task-detail">
      {/* Header */}
      <div className="detail-header">
        <button
          className="detail-check"
          style={task.completed ? { borderColor: listColor, backgroundColor: listColor } : {}}
          onClick={() => onUpdate({ completed: !task.completed })}
        >
          {task.completed && <Check size={13} strokeWidth={3} />}
        </button>
        <textarea
          ref={titleRef}
          className="detail-title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); titleRef.current?.blur() } }}
          rows={1}
        />
        <button
          className={`detail-star${task.important ? ' starred' : ''}`}
          onClick={() => onUpdate({ important: !task.important })}
        >
          <Star
            size={18}
            fill={task.important ? '#e74856' : 'none'}
            color={task.important ? '#e74856' : '#6b7280'}
          />
        </button>
      </div>

      {/* Body */}
      <div className="detail-body">

        {/* Steps */}
        <div className="detail-card">
          {task.steps.map(step => (
            <div key={step.id} className="step-row">
              <button
                className={`step-check${step.completed ? ' done' : ''}`}
                onClick={() => toggleStep(step.id)}
              >
                {step.completed && <Check size={9} strokeWidth={3} />}
              </button>
              <span className={`step-title${step.completed ? ' done' : ''}`}>{step.title}</span>
              <button className="step-del" onClick={() => deleteStep(step.id)}>
                <X size={12} />
              </button>
            </div>
          ))}
          <div className="step-add-row">
            <Plus size={14} color="#6b7280" />
            <input
              value={newStep}
              onChange={e => setNewStep(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addStep() }}
              placeholder="Add step"
            />
          </div>
        </div>

        {/* My Day */}
        <button
          className={`detail-action${task.myDay ? ' active' : ''}`}
          onClick={() => onUpdate({ myDay: !task.myDay })}
        >
          <Sun size={16} color={task.myDay ? '#4f8ef7' : '#6b7280'} />
          <span>{task.myDay ? 'Added to My Day' : 'Add to My Day'}</span>
          {task.myDay && (
            <span
              className="action-remove"
              onClick={e => { e.stopPropagation(); onUpdate({ myDay: false }) }}
            >
              <X size={13} />
            </span>
          )}
        </button>

        {/* Due Date */}
        <div className="detail-action date-action" onClick={openDatePicker}>
          <Calendar size={16} color={task.dueDate ? '#00b4d8' : '#6b7280'} />
          {task.dueDate ? (
            <>
              <span className="date-label">{formatDate(task.dueDate)}</span>
              <button
                className="action-remove"
                onClick={e => { e.stopPropagation(); onUpdate({ dueDate: null }) }}
              >
                <X size={13} />
              </button>
            </>
          ) : (
            <span className="action-placeholder">Add due date</span>
          )}
          <input
            ref={dateRef}
            type="date"
            className="date-overlay"
            value={task.dueDate || ''}
            onChange={e => onUpdate({ dueDate: e.target.value || null })}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
          />
        </div>

        {/* Notes */}
        <div className="detail-card notes-card">
          <div className="notes-icon-row">
            <FileText size={14} color="#6b7280" />
          </div>
          <textarea
            className="notes-area"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add note"
            rows={4}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="detail-footer">
        <button className="footer-close" onClick={onClose} title="Close">
          <X size={17} />
        </button>
        <span className="footer-created">Created {createdDate}</span>
        <button className="footer-delete" onClick={onDelete} title="Delete task">
          <Trash2 size={17} />
        </button>
      </div>
    </aside>
  )
}
