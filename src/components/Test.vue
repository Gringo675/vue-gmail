<script setup>
//
// import { useGmailLinks, useGmailThreadId } from '../composables/gmailAPI'
// import { useTest } from '../composables/useTest'
// const test = useTest()
// console.log(`from test.vue`)
// const gLinks = useGmailLinks()
//
// const threadId = useGmailThreadId()
const onTest = async () => {
  const response = await fetch('https://chelinstrument.ru/apis/1c/get_all_products.php', {
    method: 'POST',
    body: JSON.stringify({ api_key: 111222333 }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    // no-cors
    mode: 'no-cors',
  })
  const data = await response.text()
  console.log(`data: ${JSON.stringify(data, null, 2)}`)

  // gLinks.category.style.border = '3px solid blue'
  // gLinks.thread.style.border = '3px solid red'

  // const hhh = gLinks.category.querySelector('h2.hP')
  // hhh.style.border = '3px solid green'

  // const threadHolder = gLinks.category.querySelector('.nH.ao9')
  // console.log(`threadHolder: ${threadHolder}`)
  // const threadId = gLinks.category.querySelector('h2.hP').getAttribute('data-legacy-thread-id')
  // console.log(`threadId: ${JSON.stringify(threadId, null, 2)}`)
  // const ell = document.createElement('div')
  // ell.innerHTML = '<div>ell element 444555</div>'
  // gState.threadNode.append(ell)
}

const onTest2 = () => {
  const mess = document.getElementById('messid')
  const cont = document.getElementById('contid')

  const mCoord = mess.getBoundingClientRect()
  console.log(`mCoord: ${JSON.stringify(mCoord, null, 2)}`)
  const cCoord = cont.getBoundingClientRect()
  console.log(`cCoord: ${JSON.stringify(cCoord, null, 2)}`)

  cont.scrollBy({
    top: mCoord.bottom - cCoord.bottom,
    left: 0,
    behavior: 'smooth',
  })
}
</script>

<template>
  <!-- <teleport to="gLinks.main"> -->
  <div class="flex gap-5">
    <button @click="onTest">test</button>
    <!-- <div>category: {{ gLinks.category !== null }}</div>
    <div>thread: {{ gLinks.thread !== null }}</div>
    <button @click="onTest2">test2</button>
    <div>gTime: {{ test.gTime }}</div>
    <div>ocTime: {{ test.ocTime }}</div> -->
  </div>

  <!-- </teleport> -->
</template>
