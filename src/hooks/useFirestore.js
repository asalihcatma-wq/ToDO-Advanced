import { useState, useEffect } from 'react'
import {
  collection, doc, onSnapshot,
  setDoc, deleteDoc, writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useFirestore(userId) {
  const [tasks, setTasks]   = useState([])
  const [lists, setLists]   = useState([])
  const [ready, setReady]   = useState(false)

  useEffect(() => {
    if (!userId) return

    const taskUnsub = onSnapshot(
      collection(db, 'users', userId, 'tasks'),
      snap => {
        setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setReady(true)
      },
      () => setReady(true)
    )

    const listUnsub = onSnapshot(
      collection(db, 'users', userId, 'lists'),
      snap => setLists(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )

    return () => { taskUnsub(); listUnsub() }
  }, [userId])

  async function saveTask(task) {
    const { id, ...data } = task
    await setDoc(doc(db, 'users', userId, 'tasks', id), data)
  }

  async function removeTask(id) {
    await deleteDoc(doc(db, 'users', userId, 'tasks', id))
  }

  async function saveList(list) {
    const { id, ...data } = list
    await setDoc(doc(db, 'users', userId, 'lists', id), data)
  }

  async function removeList(id) {
    // listeyi ve bağlı taskları sil
    const batch = writeBatch(db)
    batch.delete(doc(db, 'users', userId, 'lists', id))
    tasks.filter(t => t.listId === id).forEach(t => {
      batch.delete(doc(db, 'users', userId, 'tasks', t.id))
    })
    await batch.commit()
  }

  return { tasks, lists, ready, saveTask, removeTask, saveList, removeList }
}
