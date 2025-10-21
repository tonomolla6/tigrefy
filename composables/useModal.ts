export const useModal = () => {
  const isOpen = useState('modalIsOpen', () => false)
  const modalType = useState<'confirm' | 'prompt' | 'alert'>('modalType', () => 'alert')
  const modalTitle = useState('modalTitle', () => '')
  const modalMessage = useState('modalMessage', () => '')
  const modalInputValue = useState('modalInputValue', () => '')
  const modalInputPlaceholder = useState('modalInputPlaceholder', () => '')
  const modalResolve = useState<any>('modalResolve', () => null)

  const showAlert = (title: string, message: string) => {
    return new Promise<void>((resolve) => {
      modalType.value = 'alert'
      modalTitle.value = title
      modalMessage.value = message
      isOpen.value = true
      modalResolve.value = resolve
    })
  }

  const showConfirm = (title: string, message: string) => {
    return new Promise<boolean>((resolve) => {
      modalType.value = 'confirm'
      modalTitle.value = title
      modalMessage.value = message
      isOpen.value = true
      modalResolve.value = resolve
    })
  }

  const showPrompt = (title: string, message: string, placeholder: string = '', defaultValue: string = '') => {
    return new Promise<string | null>((resolve) => {
      modalType.value = 'prompt'
      modalTitle.value = title
      modalMessage.value = message
      modalInputPlaceholder.value = placeholder
      modalInputValue.value = defaultValue
      isOpen.value = true
      modalResolve.value = resolve
    })
  }

  const closeModal = () => {
    isOpen.value = false
    modalInputValue.value = ''
  }

  const handleConfirm = () => {
    if (modalType.value === 'prompt') {
      modalResolve.value?.(modalInputValue.value || null)
    } else if (modalType.value === 'confirm') {
      modalResolve.value?.(true)
    } else {
      modalResolve.value?.()
    }
    closeModal()
  }

  const handleCancel = () => {
    if (modalType.value === 'prompt') {
      modalResolve.value?.(null)
    } else if (modalType.value === 'confirm') {
      modalResolve.value?.(false)
    }
    closeModal()
  }

  return {
    isOpen,
    modalType,
    modalTitle,
    modalMessage,
    modalInputValue,
    modalInputPlaceholder,
    showAlert,
    showConfirm,
    showPrompt,
    handleConfirm,
    handleCancel,
    closeModal
  }
}
