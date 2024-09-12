<script setup>
//
import { ref, onMounted } from 'vue'
import { createTopPanelHolder, createTaskDraft } from '../composables/gmailAPI'
const config = useConfig() // from tampermonkey

const topPanelHolder = ref(null)
onMounted(async () => {
  topPanelHolder.value = await createTopPanelHolder()
})

const checkPayments = () => {
  // дергает 1с проверить новые платежи в почте
  console.log('checkPayments')
  fetch(config.oneCUrl + 'checkPayments')
}
</script>

<template>
  <Teleport
    v-if="topPanelHolder"
    :to="topPanelHolder"
  >
    <div
      role="button"
      @click="checkPayments"
      title="Проверить платежи"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#e8eaed"
      >
        <path
          d="M160-640h640v-80H160v80Zm-80-80q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v240H160v240h164v80H160q-33 0-56.5-23.5T80-240v-480ZM598-80 428-250l56-56 114 112 226-226 56 58L598-80ZM160-720v480-180 113-413Z"
        />
      </svg>
    </div>
    <div
      role="button"
      @click="createTaskDraft"
      title="Добавить задачу"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#434343"
        class="rotate-45"
      >
        <path
          d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z"
        />
      </svg>
    </div>
  </Teleport>
</template>
