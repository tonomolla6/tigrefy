import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faPlay,
  faPause,
  faBackwardStep,
  faForwardStep,
  faShuffle,
  faRepeat,
  faHeart as faHeartSolid,
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
  faHouse,
  faCompactDisc,
  faMagnifyingGlass,
  faArrowLeft,
  faEllipsisVertical,
  faXmark,
  faMusic,
  faGlassCheers,
  faBolt,
  faMicrophone,
  faFlag
} from '@fortawesome/free-solid-svg-icons'

import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'

// Esto es importante: previene que Font Awesome agregue CSS automáticamente
config.autoAddCss = false

// Agregar iconos a la librería
library.add(
  faPlay,
  faPause,
  faBackwardStep,
  faForwardStep,
  faShuffle,
  faRepeat,
  faHeartSolid,
  faHeartRegular,
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
  faHouse,
  faCompactDisc,
  faMagnifyingGlass,
  faArrowLeft,
  faEllipsisVertical,
  faXmark,
  faMusic,
  faGlassCheers,
  faBolt,
  faMicrophone,
  faFlag
)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
})
