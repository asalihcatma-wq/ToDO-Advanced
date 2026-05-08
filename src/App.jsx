import { useState, useEffect } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import Sidebar from './components/Sidebar'
import TaskPanel from './components/TaskPanel'
import TaskDetail from './components/TaskDetail'
import { onAuthReady, signOut } from './firebase'
import { useFirestore } from './hooks/useFirestore'
import AuthScreen from './components/AuthScreen'
import './App.css'

export const SMART_LISTS = [
  { id: 'myday',     name: 'My Day',    icon: 'Sun',      color: '#16a34a' },
  { id: 'important', name: 'Important', icon: 'Star',     color: '#dc2626' },
  { id: 'planned',   name: 'Planned',   icon: 'Calendar', color: '#0891b2' },
  { id: 'tasks',     name: 'Tasks',     icon: 'ListTodo', color: '#16a34a' },
]

export default function App() {
  const [user, setUser]               = useState(undefined)
  const userId = user?.uid ?? null
  const [selectedView, setSelectedView]   = useState('myday')
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [searchQuery, setSearchQuery]     = useState('')
  const [sidebarWidth, setSidebarWidth]   = useState(220)

  const { tasks, lists, ready, saveTask, removeTask, saveList, removeList } = useFirestore(userId)

  useEffect(() => {
    return onAuthReady(u => setUser(u ?? null))
  }, [])

  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null

  function getViewTasks(viewId) {
    let filtered
    if (viewId === 'myday')         filtered = tasks.filter(t => t.myDay)
    else if (viewId === 'important') filtered = tasks.filter(t => t.important)
    else if (viewId === 'planned')   filtered = tasks.filter(t => t.dueDate)
    else                             filtered = tasks.filter(t => t.listId === viewId)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.notes || '').toLowerCase().includes(q)
      )
    }
    return filtered
  }

  function addTask(title) {
    if (!title.trim()) return
    const listId = ['myday', 'important', 'planned'].includes(selectedView)
      ? 'tasks'
      : selectedView
    const task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      important: selectedView === 'important',
      myDay: selectedView === 'myday',
      dueDate: selectedView === 'planned' ? new Date().toISOString().split('T')[0] : null,
      steps: [],
      notes: '',
      listId,
      createdAt: new Date().toISOString(),
    }
    saveTask(task)
  }

  function updateTask(id, updates) {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    saveTask({ ...task, ...updates })
  }

  function deleteTask(id) {
    removeTask(id)
    if (selectedTaskId === id) setSelectedTaskId(null)
  }

  function addList(name) {
    if (!name.trim()) return null
    const list = { id: crypto.randomUUID(), name: name.trim(), color: '#818cf8' }
    saveList(list)
    return list.id
  }

  function deleteList(id) {
    removeList(id)
    if (selectedView === id) setSelectedView('tasks')
  }

  const currentList =
    SMART_LISTS.find(l => l.id === selectedView) ||
    lists.find(l => l.id === selectedView)

  if (user === undefined) return null
  if (user === null) return <AuthScreen />

  return (
    <SidebarProvider style={{ '--sidebar-width': `${sidebarWidth}px` }}>
    <div className="app-root">
      <Sidebar
        smartLists={SMART_LISTS}
        customLists={lists}
        selectedView={selectedView}
        onSelectView={(id) => {
          setSelectedView(id)
          setSelectedTaskId(null)
          setSearchQuery('')
        }}
        onAddList={addList}
        onDeleteList={deleteList}
        tasks={tasks}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onWidthChange={setSidebarWidth}
        sidebarWidth={sidebarWidth}
      />
      <div className="app-content">
        <SidebarTrigger className="sidebar-trigger" />
        <TaskPanel
          list={currentList}
          tasks={getViewTasks(selectedView)}
          selectedTaskId={selectedTaskId}
          onSelectTask={(id) => setSelectedTaskId(id === selectedTaskId ? null : id)}
          onAddTask={addTask}
          onUpdateTask={updateTask}
          searchQuery={searchQuery}
        />
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            listColor={currentList?.color || '#818cf8'}
            allLists={[
              ...SMART_LISTS.filter(l => !['myday', 'important', 'planned'].includes(l.id)),
              ...lists,
            ]}
            onUpdate={(updates) => updateTask(selectedTask.id, updates)}
            onDelete={() => deleteTask(selectedTask.id)}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </div>
    </div>
    </SidebarProvider>
  )
}
