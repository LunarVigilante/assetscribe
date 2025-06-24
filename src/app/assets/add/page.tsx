import React, { Suspense } from 'react'
import { AddAssetForm } from '@/components/assets/add-asset-form'
import { Loader2 } from 'lucide-react'

function AddAssetLoading() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading asset form...</span>
      </div>
    </div>
  )
}

export default function AddAssetPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Suspense fallback={<AddAssetLoading />}>
        <AddAssetForm />
      </Suspense>
    </div>
  )
} 