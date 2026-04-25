// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // SSR híbrido: páginas como SPA, API con SSR
  ssr: true,

  routeRules: {
    '/**': { ssr: false },
    '/api/**': { ssr: true }
  },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  css: [
    '~/assets/css/main.css',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],

  app: {
    head: {
      title: 'Tigrefy - Music for everyone',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Tigrefy - Tu app de música favorita' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/favicon.png' }
      ]
    }
  },

  // Variables de entorno para el servidor
  runtimeConfig: {
    tursoUrl: process.env.TURSO_DATABASE_URL,
    tursoToken: process.env.TURSO_AUTH_TOKEN,
    jwtSecret: process.env.JWT_SECRET,
    // R2 Media - firma HMAC para audio (no para imágenes)
    r2SigningSecret: process.env.R2_SIGNING_SECRET,
    // R2 Access - lectura de playlists y uploads
    r2AccountId: process.env.R2_ACCOUNT_ID,
    r2AccessKeyId: process.env.R2_MEDIA_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_MEDIA_SECRET_ACCESS_KEY,
    r2BucketName: process.env.R2_MEDIA_BUCKET || 'tigrefy',
    public: {
      // Dominio R2 público (covers/artists). Vacío en dev → fallback a /public.
      r2MediaDomain: process.env.R2_MEDIA_DOMAIN || '',
    },
  },

  nitro: {
    preset: 'cloudflare-module'
  },

  // ffmpeg.wasm usa Web Workers que el optimizer de Vite rompe.
  // Hay que excluirlos para que se carguen tal cual desde node_modules.
  vite: {
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
    }
  }
})
