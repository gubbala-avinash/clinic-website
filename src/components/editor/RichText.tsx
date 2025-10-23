import { useRef } from 'react'

export function RichText({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  return (
    <div className="rounded-md border">
      <div className="flex items-center gap-2 border-b px-2 py-1 text-sm">
        <button type="button" className="px-2 py-1 hover:bg-gray-50 rounded" onClick={()=> document.execCommand('bold')}>B</button>
        <button type="button" className="px-2 py-1 hover:bg-gray-50 rounded" onClick={()=> document.execCommand('italic')}>I</button>
        <button type="button" className="px-2 py-1 hover:bg-gray-50 rounded" onClick={()=> document.execCommand('underline')}>U</button>
      </div>
      <div
        ref={ref}
        className="min-h-32 p-3 prose prose-sm max-w-none focus:outline-none"
        contentEditable
        data-placeholder={placeholder}
        onInput={(e)=> onChange((e.target as HTMLDivElement).innerHTML)}
        dangerouslySetInnerHTML={{ __html: value || '' }}
      />
    </div>
  )
}


