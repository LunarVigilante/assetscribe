import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get all possible stock photo URLs for a category in priority order
 * Priority: JPG > JPEG > PNG > WebP > SVG
 */
export function getCategoryStockPhotoUrls(categoryName: string): string[] {
  if (!categoryName) return []
  
  // Convert category name to filename format (lowercase, replace spaces/special chars with hyphens)
  const sanitizedName = categoryName.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  
  // Priority order: PNG > JPG > WebP > SVG (SVG as final fallback)
  const formats = ['png', 'jpg', 'webp', 'svg']
  
  return formats.map(format => `/stock-photos/categories/${sanitizedName}.${format}`)
}

/**
 * Get the stock photo URL for a category, checking multiple formats
 * Priority: JPG > JPEG > PNG > WebP > SVG
 */
export function getCategoryStockPhotoUrl(categoryName: string): string | null {
  const urls = getCategoryStockPhotoUrls(categoryName)
  return urls.length > 0 ? urls[0] : null
}

/**
 * Get the best available photo URL for an asset
 * Priority: Asset-specific > Model photo > Category stock photo
 */
export function getAssetPhotoUrl(
  assetImageUrl?: string | null,
  modelImageUrl?: string | null, 
  categoryName?: string
): string | null {
  // First priority: asset-specific photo
  if (assetImageUrl) return assetImageUrl
  
  // Second priority: model photo
  if (modelImageUrl) return modelImageUrl
  
  // Third priority: category stock photo
  if (categoryName) {
    return getCategoryStockPhotoUrl(categoryName)
  }
  
  return null
}

/**
 * Create an onError handler that tries multiple image formats in priority order
 */
export function createImageFallbackHandler(categoryName: string) {
  const urls = getCategoryStockPhotoUrls(categoryName)
  let currentIndex = 0
  
  return function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
    const target = e.target as HTMLImageElement
    currentIndex++
    
    if (currentIndex < urls.length) {
      target.src = urls[currentIndex]
    } else {
      // All formats failed, show placeholder
      target.style.display = 'none'
      if (target.parentElement) {
        target.parentElement.innerHTML = `
          <div class="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-sm text-center">No photo available</span>
          </div>
        `
      }
    }
  }
} 