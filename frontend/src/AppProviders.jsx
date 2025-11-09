import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
const qc = new QueryClient()
export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={qc}>
      <Toaster position="top-center" />
      {children}
    </QueryClientProvider>
  )
}
