<script setup>
//
import { useGmailLinks, initGmailLinks } from './composables/gmailAPI'
import Snippets from './components/Snippets.vue'
import AddTaskButton from './components/AddTaskButton.vue'
// import Test from './components/Test.vue'
import ThreadInfoBlock from './components/ThreadInfoBlock.vue'

const gLinks = useGmailLinks()
initGmailLinks()
</script>

<template>
  <ThreadInfoBlock v-if="gLinks.thread" />
  <Snippets />
  <AddTaskButton />
  <!-- <Test /> -->
</template>
