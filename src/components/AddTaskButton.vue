<script setup>
//
import { ref, onMounted } from 'vue'
import { createAddTaskHolder, createTaskDraft } from '../composables/gmailAPI'

const taskHolder = ref(null)
onMounted(async () => {
  taskHolder.value = await createAddTaskHolder()
})
</script>

<template>
  <Teleport
    v-if="taskHolder"
    :to="taskHolder"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="#434343"
      class="align-middle cursor-pointer px-2 rotate-45"
      title="Добавить задачу"
      @click="createTaskDraft"
    >
      <path
        d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z"
      />
    </svg>
  </Teleport>
</template>
