<script setup>
import { ref } from 'vue'
import { getOpenDraft } from '../composables/gmailAPI.js'
import { snippets } from '../composables/snippetsTemplate.js'

let draft = null
const showSnippets = ref(false)

document.addEventListener(
  'keydown',
  event => {
    if (event.code === 'Backquote' && !showSnippets.value) activateSnippets()
    else if (showSnippets.value) {
      showSnippets.value = false
      if (Number(event.key) <= snippets.length) insertSnippet(event)
    }
  },
  true // позволяет оставить (или вставляет?) активный блок ввода текста в черновике (что позволяет использовать draft.insertAdjacentHTML...)
)

const activateSnippets = () => {
  // ищем открытый черновик
  draft = getOpenDraft()
  if (!draft) return

  showSnippets.value = true
}

const insertSnippet = event => {
  event.preventDefault()
  // все удалять нельзя, т.к. есть блоки цитирования и подписи
  draft.querySelectorAll('.gmail_default').forEach(item => {
    item.remove()
  })
  const snippet = snippets[event.key - 1]
  setTimeout(() => {
    draft.insertAdjacentHTML('afterbegin', snippet.code)
  }, 10)
}
</script>

<template>
  <Transition name="transition-snippets">
    <div
      v-if="showSnippets"
      class="absolute bottom-10 right-10 z-10 px-2 py-1 rounded-lg bg-slate-200 opacity-80 transition-all"
    >
      <div
        v-for="(snippet, key) in snippets"
        class="border-t-2 border-b-0 border-r-0 border-l-0 border-slate-300 border-solid first:border-t-0 p-2"
      >
        {{ key + 1 }}. {{ snippet.name }}
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.transition-snippets-enter-from,
.transition-snippets-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>
