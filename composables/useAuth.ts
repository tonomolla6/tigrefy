export const useAuth = () => {
  // Hash SHA-256 de "lostigres"
  const PASSWORD_HASH = '70b5011996edbd68f5a9e50c45eae111d63e980840a13723e920ccd7b4773b35'

  const isAuthenticated = useState<boolean>('isAuthenticated', () => false)

  const generateHash = async (password: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const login = async (password: string): Promise<boolean> => {
    const hash = await generateHash(password)

    if (hash === PASSWORD_HASH) {
      isAuthenticated.value = true
      if (process.client) {
        sessionStorage.setItem('tigrefy_auth', 'true')
      }
      return true
    }

    return false
  }

  const logout = () => {
    isAuthenticated.value = false
    if (process.client) {
      sessionStorage.removeItem('tigrefy_auth')
    }
  }

  const checkAuth = () => {
    if (process.client) {
      const auth = sessionStorage.getItem('tigrefy_auth')
      isAuthenticated.value = auth === 'true'
    }
  }

  return {
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
}
