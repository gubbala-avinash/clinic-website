import * as Dialog from '@radix-ui/react-dialog'

export function Modal({ trigger, title, children }: { trigger: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg rounded-lg bg-white shadow-lg p-4">
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          <div className="mt-3">{children}</div>
          <div className="mt-4 flex justify-end">
            <Dialog.Close asChild>
              <button className="rounded-md border px-3 py-1.5">Close</button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}


