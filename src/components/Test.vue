<script setup>
//
import { useGmailLinks, useGmailThreadId } from '../composables/gmailAPI'
console.log(`from test.vue`)
const gLinks = useGmailLinks()

const threadId = useGmailThreadId()
const onTest = () => {
  gLinks.category.style.border = '3px solid blue'
  gLinks.thread.style.border = '3px solid red'

  const hhh = gLinks.category.querySelector('h2.hP')
  hhh.style.border = '3px solid green'

  // const threadHolder = gLinks.category.querySelector('.nH.ao9')
  // console.log(`threadHolder: ${threadHolder}`)
  // const threadId = gLinks.category.querySelector('h2.hP').getAttribute('data-legacy-thread-id')
  // console.log(`threadId: ${JSON.stringify(threadId, null, 2)}`)
  // const ell = document.createElement('div')
  // ell.innerHTML = '<div>ell element 444555</div>'
  // gState.threadNode.append(ell)
}
</script>

<template>
  <!-- <teleport to="gLinks.main"> -->
  <div class=""></div>
  <button @click="onTest">test</button>
  <span>threadId: {{ threadId }}</span>
  <!-- </teleport> -->
</template>
