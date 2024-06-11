<script setup>
//
import { reactive, watch } from 'vue'
import { useGmailLinks, useGmailThreadId, findAllThreads, goToAttachment } from '../composables/gmailAPI'

const config = useConfig() // from tampermonkey

const gLinks = useGmailLinks()
const threadId = useGmailThreadId()
const cache = {}
const state = reactive({
  otherThreads: null,
  attachments: null,
  notice: null,
  bills: null,
})

const getThreadData = async () => {
  if (checkCache()) return

  // reset state
  state.otherThreads = null
  state.attachments = null
  state.notice = null
  state.bills = null

  const currentThreadId = threadId.value // для отмены запроса
  const response = await fetch(config.googleScriptUrl2, {
    method: 'post',
    body: JSON.stringify({
      GAS_API: config.googleScriptPassword2,
      method: 'getThreadInfo',
      data: currentThreadId,
    }),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  })
  const googleData = (await response.json()).response

  if (currentThreadId !== threadId.value) return

  state.otherThreads = googleData.otherThreads
  state.attachments = googleData.attachments
  state.notice = googleData.notice

  // получаем счета из 1С по одному полученному счету из googleData
  if (googleData.bill) {
    // запрос в 1с
    const response = await fetch(config.oneCUrl + 'getCustomerBills', {
      method: 'POST',
      body: JSON.stringify({
        number: googleData.bill.number,
        date: googleData.bill.date,
        password: config.oneCPassword,
      }),
    })
    if (currentThreadId !== threadId.value) return
    state.bills = await response.json()
  } else state.bills = []
  setToCache()
  console.log(`state: ${JSON.stringify(state, null, 2)}`)
}
function checkCache() {
  const cached = cache[threadId.value]
  if (!cached) return false
  state.attachments = cached.attachments
  state.bills = cached.bills
  state.notice = cached.notice
  state.otherThreads = cached.otherThreads
  return true
}
function setToCache() {
  cache[threadId.value] = {
    attachments: [...state.attachments],
    bills: [...state.bills],
    notice: state.notice,
    otherThreads: state.otherThreads,
  }
}
watch(threadId, getThreadData, { immediate: true })
</script>

<template>
  <teleport :to="gLinks.threadInfoHolder">
    <div class="flex align-center self-center gap-10 z-10">
      <div
        title="Другие цепочки"
        class="flex align-center items-center cursor-pointer"
        @click="findAllThreads"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#434343"
        >
          <path
            d="M280-280q-33 0-56.5-23.5T200-360v-400q0-33 23.5-56.5T280-840h560q33 0 56.5 23.5T920-760v400q0 33-23.5 56.5T840-280H280Zm280-188L280-663v303h560v-303L560-468Zm0-98 280-194H280l280 194ZM120-120q-33 0-56.5-23.5T40-200v-500h80v500h660v80H120Zm720-546v-94H280v94-94h560v94Z"
          />
        </svg>
        <div class="mx-2">{{ state.otherThreads !== null ? state.otherThreads : '...' }}</div>
      </div>
      <div
        title="Вложения"
        class="group flex align-center items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#434343"
        >
          <path
            d="M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-370h80v370q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-390h80v390Z"
          />
        </svg>
        <div class="mx-2">{{ state.attachments !== null ? state.attachments.length : '...' }}</div>
        <div
          v-if="state.attachments?.length"
          class="absolute top-7 hidden group-hover:block rounded-md bg-slate-200 z-10"
        >
          <div class="m-2">
            <a
              v-for="attachment in state.attachments"
              class="block"
              @click="goToAttachment(attachment)"
            >
              {{ attachment.name }}</a
            >
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
