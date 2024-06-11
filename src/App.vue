<script setup>
//
import { useGmailLinks, initGmailLinks } from './composables/gmailAPI'
import Test from './components/Test.vue'
import ThreadInfoBlock from './components/ThreadInfoBlock.vue'

const gLinks = useGmailLinks()
initGmailLinks()
</script>

<template>
  <ThreadInfoBlock v-if="gLinks.thread" />
  <Test />
</template>
