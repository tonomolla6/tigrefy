interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}

export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => [])
  let toastId = 0

  const show = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
    const id = toastId++
    const toast: Toast = { id, message, type, duration }

    toasts.value.push(toast)

    setTimeout(() => {
      remove(id)
    }, duration)
  }

  const remove = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => {
    show(message, 'success', duration)
  }

  const error = (message: string, duration?: number) => {
    show(message, 'error', duration)
  }

  const info = (message: string, duration?: number) => {
    show(message, 'info', duration)
  }

  return {
    toasts,
    show,
    remove,
    success,
    error,
    info
  }
}
