<script setup>
//
console.log(`from testDraft.vue`)

const onTest = async () => {
  console.log(`onTest`)
  const fromHolder = await getDomElementHelper('.J-JN-M-I.J-J5-Ji.az2.az4')
  const mdEvent = new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
  })
  fromHolder.dispatchEvent(mdEvent)

  const fromItem = await getDomElementHelper('.jQjAxd .J-N.HX')
  const itemCoords = fromItem.getBoundingClientRect()
  const muEvent = new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true,
    clientX: Math.round(itemCoords.x + itemCoords.width / 2),
    clientY: Math.round(itemCoords.y + itemCoords.height / 2),
  })
  fromItem.dispatchEvent(muEvent)
}

const getDomElementHelper = async (selector, parent = document) => {
  let element
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 200))
    element = parent.querySelector(selector)
    if (element) break
  }
  if (!element)
    console.error(
      `getDomElementHelper error! Can't find ${parent === document ? 'document' : parent}.querySelector('${selector}')`
    )
  return element
}
</script>

<template>
  <button
    class="mx-5 my-2"
    @click="onTest"
  >
    TEST
  </button>
</template>
