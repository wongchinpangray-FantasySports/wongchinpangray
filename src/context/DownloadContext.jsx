import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import DownloadLeadModal from '../components/DownloadLeadModal'

const DownloadContext = createContext(null)

export function DownloadProvider({ children }) {
  const [documentType, setDocumentType] = useState(null)

  const openDownload = useCallback((type) => {
    setDocumentType(type)
  }, [])

  const closeDownload = useCallback(() => {
    setDocumentType(null)
  }, [])

  const value = useMemo(
    () => ({
      openDownload,
      closeDownload,
      documentType,
    }),
    [openDownload, closeDownload, documentType],
  )

  return (
    <DownloadContext.Provider value={value}>
      {children}
      <DownloadLeadModal documentType={documentType} onClose={closeDownload} />
    </DownloadContext.Provider>
  )
}

export function useDownload() {
  const context = useContext(DownloadContext)
  if (!context) {
    throw new Error('useDownload must be used within DownloadProvider')
  }
  return context
}
