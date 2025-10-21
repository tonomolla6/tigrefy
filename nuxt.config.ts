// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Configuración para Cloudflare Pages
  ssr: false,

  modules: ['@nuxtjs/tailwindcss'],

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
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  nitro: {
    preset: 'cloudflare-pages'
  }
})
