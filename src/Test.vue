<script setup>
//
import Test2 from './components/Test2.vue'
</script>

<template>
  <div class="">test1 block</div>
  <Suspense>
    <Test2 />
    <template #fallback> Loading... </template>
  </Suspense>
</template>
