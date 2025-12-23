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
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  // Variables de entorno para el servidor
  runtimeConfig: {
    tursoUrl: process.env.TURSO_DATABASE_URL,
    tursoToken: process.env.TURSO_AUTH_TOKEN,
    jwtSecret: process.env.JWT_SECRET,
  },

  nitro: {
    preset: 'cloudflare-pages'
  }
})
