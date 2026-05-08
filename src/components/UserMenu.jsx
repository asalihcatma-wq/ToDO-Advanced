import { useState, useRef, useEffect } from 'react'
import { LogOut, UserCircle } from 'lucide-react'
import { auth, signOut } from '../firebase'

export default function UserMenu() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(auth.currentUser)
  const ref = useRef(null)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u))
    return unsub
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!user) return null

  const isGuest = user.isAnonymous
  const name    = user.displayName || (isGuest ? 'Guest' : 'User')
  const email   = user.email || ''

  return (
    <div className="user-menu-wrap" ref={ref}>
      <button className="user-avatar-btn" onClick={() => setOpen(v => !v)} title={name}>
        <UserCircle size={26} color="#16a34a" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-info">
            <UserCircle size={36} color="#16a34a" strokeWidth={1.5} />
            <div>
              <p className="user-dropdown-name">{name}</p>
              {email && <p className="user-dropdown-email">{email}</p>}
              {isGuest && <p className="user-dropdown-email">Anonymous account</p>}
            </div>
          </div>
          <div className="user-dropdown-divider" />
          <button className="user-dropdown-item signout" onClick={signOut}>
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
