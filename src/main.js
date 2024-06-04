import './css/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// to settle gmailTrusted-Types errors
if (window.trustedTypes && window.trustedTypes.createPolicy) {
  window.trustedTypes.createPolicy('default', {
    createHTML: string => string,
    createScriptURL: string => string,
    createScript: string => string,
  })
}

const config = useConfig()
console.log(`config: ${JSON.stringify(config, null, 2)}`)

const myApp = document.createElement('div')
myApp.id = 'vue-app'
document.body.append(myApp)
createApp(App).mount('#vue-app')
