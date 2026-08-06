import { useRef, useState } from 'react'
import { ImagePlus, LoaderCircle, X } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/utils/cn'
import { MAX_FUNCTION_PHOTOS } from '@/utils/format'
import { fileToResizedDataUrl } from '@/utils/image'

interface FunctionPhotosProps {
  photos: string[]
  onAdd: (dataUrls: string[]) => void
  onRemove: (index: number) => void
}

export function FunctionPhotos({ photos, onAdd, onRemove }: FunctionPhotosProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [adding, setAdding] = useState(false)
  const remaining = Math.max(0, MAX_FUNCTION_PHOTOS - photos.length)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setAdding(true)
    try {
      const dataUrls: string[] = []
      for (const file of Array.from(files).slice(0, remaining)) {
        dataUrls.push(await fileToResizedDataUrl(file))
      }
      if (dataUrls.length > 0) onAdd(dataUrls)
    } catch {
      toast.error('Could not read that image. Please try another file.')
    } finally {
      setAdding(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Photos</p>
        <p className="text-xs font-medium text-slate-400">
          {photos.length}/{MAX_FUNCTION_PHOTOS}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: MAX_FUNCTION_PHOTOS }).map((_, i) => {
          const src = photos[i]
          if (src) {
            return (
              <div
                key={i}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
              >
                <img
                  src={src}
                  alt={`Photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => onRemove(i)}
                  className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-slate-900/60 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  aria-label={`Remove photo ${i + 1}`}
                >
                  <X className="size-3" />
                </button>
              </div>
            )
          }
          return (
            <button
              key={i}
              type="button"
              disabled={adding}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 text-slate-400 transition-colors',
                'hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600',
                adding && 'cursor-default opacity-50 hover:bg-transparent hover:text-slate-400',
              )}
              aria-label="Add photo"
            >
              {adding && i === 0 ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
            </button>
          )
        })}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs font-medium text-slate-400">
        You can select multiple photos at once.
      </p>
    </div>
  )
}