<script setup>
//
import { computed, reactive, watch, ref } from 'vue'
import { useGmailLinks, useGmailThreadId, findAllThreads, goToAttachment } from '../composables/gmailAPI'
import { getFromCache, setToCache } from '../composables/threadInfoCache'
// import { useTest } from '../composables/useTest'

const config = useConfig() // from tampermonkey
// const test = useTest()

const gLinks = useGmailLinks()
const threadId = useGmailThreadId()
const state = reactive({
  otherThreads: null,
  attachments: null,
  notice: null,
  bills: null,
})

const countBills = computed(() => {
  const counted = {
    total: state.bills?.length ?? 0,
    done: 0,
    inProgress: 0,
    expired: 0,
    paymentRequired: 0,
  }
  state.bills?.forEach(bill => {
    if (bill.status) counted[bill.status]++
  })
  return counted
})

const getThreadData = async () => {
  if (checkCache()) return

  // reset state
  state.otherThreads = null
  state.attachments = null
  state.notice = null
  state.bills = null

  const currentThreadId = threadId.value // для отмены запроса
  // let start = performance.now()
  const response = await fetch(config.googleScriptUrl2, {
    method: 'post',
    body: JSON.stringify({
      GAS_API: config.googleScriptPassword2,
      method: 'getThreadInfo',
      data: currentThreadId,
    }),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  })
  const receivedData = (await response.json()).response
  // console.log(`currentThreadId: ${JSON.stringify(currentThreadId, null, 2)}`)
  // console.log(`receivedData: ${JSON.stringify(receivedData, null, 2)}`)
  // test.gTime = Math.round(performance.now() - start) / 1000
  // получаем счета из 1С по одному полученному счету из googleData
  if (receivedData.bill) {
    // start = performance.now()
    const response = await fetch(config.oneCUrl + 'getCustomerBills', {
      method: 'POST',
      body: JSON.stringify({
        number: receivedData.bill.number,
        date: receivedData.bill.date,
        password: config.oneCPassword,
      }),
    })
    receivedData.bills = await response.json()

    // test.ocTime = Math.round(performance.now() - start) / 1000
  } else receivedData.bills = []

  setToCache(currentThreadId, receivedData)

  if (currentThreadId === threadId.value) {
    state.otherThreads = receivedData.otherThreads
    state.attachments = receivedData.attachments
    state.notice = receivedData.notice
    state.bills = receivedData.bills
  }
}
function checkCache() {
  const cached = getFromCache(threadId.value)
  if (!cached) return false
  state.attachments = cached.attachments
  state.bills = cached.bills
  state.notice = cached.notice
  state.otherThreads = cached.otherThreads
  return true
}

watch(threadId, getThreadData, { immediate: true })

const currentYear = new Date().getFullYear().toString() // чтобы не вычислять для каждого счета
const createBillLink = billName => {
  // сформируем ссылку на счет. Для этого нужно знать год счета (счета прошлых лет лежат в отдельных папках)
  const billYear = billName.slice(-4)
  const billFolder = billYear !== currentYear ? billYear + '/' : ''
  return `http://localhost/bills1c/${billFolder}%D0%A1%D1%87%D0%B5%D1%82%20%D0%BD%D0%B0%20%D0%BE%D0%BF%D0%BB%D0%B0%D1%82%D1%83%20%E2%84%96%20${billName}.pdf`
}

const noticeUpdaterState = ref(null)
const updateNotice = async () => {
  noticeUpdaterState.value = 'loading'
  const response = await fetch(config.googleScriptUrl2, {
    method: 'post',
    body: JSON.stringify({
      GAS_API: config.googleScriptPassword2,
      method: 'updateThreadNotice',
      data: { threadId: threadId.value, notice: state.notice },
    }),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  })
  const isNoticeSaved = (await response.json()).response

  if (isNoticeSaved) {
    setToCache(threadId.value, state)
    noticeUpdaterState.value = 'success'
    setTimeout(() => (noticeUpdaterState.value = null), 2000)
  } else noticeUpdaterState.value = 'error'
}
</script>

<template>
  <teleport :to="gLinks.threadInfoHolder">
    <div
      class="flex align-center self-center gap-4"
      :class="{ 'opacity-50 pointer-events-none cursor-default': state.otherThreads === null }"
    >
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
        <span class="border border-stone-600 border-solid rounded-full ml-1 px-2 min-w-3 text-center">{{
          state.otherThreads !== null ? state.otherThreads : '...'
        }}</span>
      </div>
      <div
        title="Вложения"
        class="group relative flex align-center items-center"
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
        <span class="border border-stone-600 border-solid rounded-full px-2 min-w-3 text-center cursor-default">{{
          state.attachments !== null ? state.attachments.length : '...'
        }}</span>
        <div
          v-if="state.attachments?.length"
          class="absolute top-[23px] hidden group-hover:block z-10"
        >
          <div class="mt-1.5 py-1 rounded-b-lg bg-[#e3d9d6] max-h-[600px] overflow-y-auto">
            <div
              v-for="attachment in state.attachments"
              class="cursor-pointer my-2 mx-3 p-2 rounded-lg text-stone-700 font-medium hover:scale-105 transition-transform duration-300 bg-stone-300 max-w-80 overflow-hidden text-ellipsis"
              @click="goToAttachment(attachment)"
              :title="attachment.name"
            >
              {{ attachment.name }}
            </div>
          </div>
        </div>
      </div>
      <div class="group relative flex align-center items-center cursor-default">
        <div title="Счета">
          <svg
            class="align-middle"
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#434343"
          >
            <path
              d="M240-80q-50 0-85-35t-35-85v-120h120v-560h600v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-600H320v480h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm0 0h-40 400-360Z"
            />
          </svg>
        </div>
        <div class="mx-0.5 gap-1 flex">
          <span
            class="border border-stone-600 border-solid rounded-full px-2 min-w-3 text-center"
            title="Всего"
            >{{ state.bills !== null ? countBills.total : '...' }}</span
          >
          <template v-if="countBills.total">
            <span
              v-if="countBills.inProgress"
              class="border border-stone-600 border-solid rounded-full px-2 bg-yellow-200 min-w-3 text-center"
              title="В процессе"
              >{{ countBills.inProgress }}</span
            >
            <span
              v-if="countBills.expired"
              class="border border-stone-600 border-solid rounded-full px-2 bg-red-300 min-w-3 text-center"
              title="Просрочено"
              >{{ countBills.expired }}</span
            >
            <span
              v-if="countBills.paymentRequired"
              class="border border-stone-600 border-solid rounded-full px-2 bg-indigo-300 min-w-3 text-center"
              title="Не оплачено"
              >{{ countBills.paymentRequired }}</span
            >
            <span
              v-if="countBills.done"
              class="border border-stone-600 border-solid rounded-full px-2 bg-green-300 min-w-3 text-center"
              title="Завершено"
              >{{ countBills.done }}</span
            >
          </template>
        </div>
        <div
          v-if="countBills.total > 0"
          class="absolute top-[23px] hidden group-hover:block z-10"
        >
          <div class="mt-1.5 py-1 rounded-b-lg bg-[#e3d9d6] max-h-[600px] overflow-y-auto">
            <a
              v-for="bill in state.bills"
              class="block no-underline my-2 mx-3 p-2 rounded-lg text-stone-700 font-medium hover:scale-105 transition-transform duration-300"
              :class="{
                'bg-stone-300': bill.status === 'unpaid',
                'bg-green-300': bill.status === 'done',
                'bg-yellow-200': bill.status === 'inProgress',
                'bg-red-300': bill.status === 'expired',
                'bg-indigo-300': bill.status === 'paymentRequired',
              }"
              :title="bill.shipmentDate ? `До ${bill.shipmentDate}` : ''"
              :href="createBillLink(bill.name)"
            >
              {{ bill.name }}
            </a>
          </div>
        </div>
      </div>
      <div class="">
        <input
          v-model.lazy="state.notice"
          @change="updateNotice"
          type="text"
          class="w-96 px-2 bg-transparent border rounded-xl focus:outline-none"
          :class="{
            'border-amber-300 shadow-inner shadow-amber-300': noticeUpdaterState === 'loading',
            'border-red-300 shadow-inner shadow-red-300': noticeUpdaterState === 'error',
            'border-green-300 shadow-inner shadow-green-300': noticeUpdaterState === 'success',
          }"
          placeholder="Заметка..."
        />
      </div>
    </div>
  </teleport>
</template>
