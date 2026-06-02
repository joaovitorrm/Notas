import { createContext, useContext, useEffect, useState } from 'react'
import { DatabaseConnection } from '../db'

type DatabaseContextType = {
  db: DatabaseConnection | null
  ready: boolean
}

const DatabaseContext = createContext<DatabaseContextType>({ db: null, ready: false })

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DatabaseConnection | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    DatabaseConnection.get()
      .then(instance => {
        setDb(instance)
        setReady(true)
      })
      .catch(err => console.error('Erro ao inicializar banco:', err))
  }, [])

  return (
    <DatabaseContext.Provider value={{ db, ready }}>
      {children}
    </DatabaseContext.Provider>
  )
}

export const useDatabase = () => useContext(DatabaseContext)