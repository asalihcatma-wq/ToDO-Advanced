import { useState, useRef } from 'react'
import { Sun, Star, Calendar, ListTodo, List, Plus, Trash2, X, Check, CheckSquare, Search } from 'lucide-react'
import {
  Sidebar as ShadSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar'

const ICONS = { Sun, Star, Calendar, ListTodo }

export default function Sidebar({
  smartLists, customLists, selectedView,
  onSelectView, onAddList, onDeleteList,
  tasks, searchQuery, onSearch,
  onWidthChange, sidebarWidth,
}) {
  const [addingList, setAddingList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  function handleResizeMouseDown(e) {
    e.preventDefault()
    startX.current = e.clientX
    startWidth.current = sidebarWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    function onMouseMove(e) {
      const newWidth = Math.max(160, Math.min(400, startWidth.current + e.clientX - startX.current))
      onWidthChange(newWidth)
    }

    function onMouseUp() {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  function getCount(listId) {
    if (listId === 'myday')     return tasks.filter(t => t.myDay && !t.completed).length
    if (listId === 'important') return tasks.filter(t => t.important && !t.completed).length
    if (listId === 'planned')   return tasks.filter(t => t.dueDate && !t.completed).length
    return tasks.filter(t => t.listId === listId && !t.completed).length
  }

  function handleAddList() {
    if (newListName.trim()) {
      const id = onAddList(newListName)
      if (id) onSelectView(id)
    }
    setAddingList(false)
    setNewListName('')
  }

  return (
    <ShadSidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <div className="todo-logo">
          <CheckSquare size={20} color="#16a34a" strokeWidth={2.5} />
          <span>To Do</span>
        </div>

        <button
          className={`search-toggle ${showSearch ? 'active' : ''}`}
          onClick={() => { if (showSearch) onSearch(''); setShowSearch(v => !v) }}
          title="Search"
        >
          <Search size={15} />
        </button>

        {showSearch && (
          <div className="search-bar">
            <Search size={13} />
            <input
              autoFocus
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search tasks…"
            />
            {searchQuery && (
              <button onClick={() => onSearch('')}><X size={12} /></button>
            )}
          </div>
        )}
      </SidebarHeader>

      {/* Main nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {smartLists.map(list => {
                const Icon = ICONS[list.icon]
                const count = getCount(list.id)
                const isActive = selectedView === list.id
                return (
                  <SidebarMenuItem key={list.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onSelectView(list.id)}
                      tooltip={list.name}
                      style={isActive ? { '--accent-color': list.color } : {}}
                    >
                      <Icon
                        size={17}
                        style={isActive ? { color: list.color } : {}}
                      />
                      <span>{list.name}</span>
                    </SidebarMenuButton>
                    {count > 0 && (
                      <SidebarMenuBadge>{count}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {customLists.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>My Lists</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {customLists.map(list => {
                    const count = getCount(list.id)
                    const isActive = selectedView === list.id
                    return (
                      <SidebarMenuItem key={list.id}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => onSelectView(list.id)}
                          tooltip={list.name}
                          style={isActive ? { '--accent-color': list.color } : {}}
                        >
                          <List
                            size={17}
                            style={isActive ? { color: list.color } : {}}
                          />
                          <span>{list.name}</span>
                        </SidebarMenuButton>
                        {count > 0 && (
                          <SidebarMenuBadge>{count}</SidebarMenuBadge>
                        )}
                        <SidebarMenuAction
                          showOnHover
                          onClick={() => onDeleteList(list.id)}
                          title="Delete list"
                          className="delete-action"
                        >
                          <Trash2 size={14} />
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer — new list */}
      <SidebarFooter>
        {addingList ? (
          <div className="new-list-form">
            <List size={15} />
            <input
              autoFocus
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddList()
                if (e.key === 'Escape') { setAddingList(false); setNewListName('') }
              }}
              placeholder="List name"
            />
            <button className="form-confirm" onClick={handleAddList}><Check size={14} /></button>
            <button className="form-cancel" onClick={() => { setAddingList(false); setNewListName('') }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setAddingList(true)} tooltip="New list">
                <Plus size={16} />
                <span>New list</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>

      <div className="sidebar-resize-handle" onMouseDown={handleResizeMouseDown} />
    </ShadSidebar>
  )
}
