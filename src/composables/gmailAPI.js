import { computed, reactive } from 'vue'

const links = reactive({
  category: null,
  thread: null,
  threadInfoHolder: null,
})

export const useGmailLinks = () => links

export const initGmailLinks = async () => {
  let mainNode = null // корневой элемент, который будем слушать
  while (1) {
    await new Promise(resolve => setTimeout(resolve, 500))
    mainNode = document.querySelector('div.aeF > div.nH')
    if (mainNode !== null) break
  }

  const observer = new MutationObserver(mutationRecords => {
    // console.log(mutationRecords)
    mutationRecords.forEach(mutation => {
      // console.log(mutation)
      mutation.addedNodes.forEach(async addedNode => {
        // console.log('addedNode: ', addedNode)
        // добавленный элемент автоматически становится основной категорией
        if (!addedNode.classList.contains('S4')) {
          // особое условие для поиска, который засовывает основную категорию внутрь добавленного элемента
          await new Promise(resolve => setTimeout(resolve, 500)) // элементы добавляются асинхронно
          links.category = addedNode.querySelector('.S4')
        } else links.category = addedNode
        // console.log('links.category: ', links.category)
        links.thread = null // новая категория всегда открывается без активной цепочки
        handleNewCategory()
      })
    })
  })
  observer.observe(mainNode, {
    childList: true,
    subtree: false,
    attributes: false,
    // attributeFilter: [],
    characterData: false,
    attributeOldValue: false,
    characterDataOldValue: false,
  })
}

const handleNewCategory = () => {
  // вешаем обсервер на добавленную категорию, который будет следить за аттрибутом role
  const categoryObserver = new MutationObserver(mutationRecords => {
    mutationRecords.forEach(mutation => {
      // console.log(mutation)
      if (mutation.target.getAttribute('role') && mutation.target !== links.category) {
        // console.log('new category: ', mutation.target)
        links.category = mutation.target
        links.thread = links.category.querySelector('.a98.aHo')
        links.threadInfoHolder = links.category.querySelector('.threadInfoHolder')
        // console.log('refreshed thread: ', links.thread)
      }
    })
  })
  categoryObserver.observe(links.category, {
    childList: false,
    subtree: false,
    attributes: true,
    attributeFilter: ['role'],
    characterData: false,
    attributeOldValue: false,
    characterDataOldValue: false,
  })

  const threadHolder = links.category.querySelector('.nH.ao9')
  // вешаем обсервер для слежения за выбором новой цепочки (или отсутствия активной)
  const threadObserver = new MutationObserver(mutationRecords => {
    mutationRecords.forEach(mutation => {
      // console.log(mutation)
      mutation.addedNodes.forEach(addedNode => {
        if (addedNode.classList?.contains('aHo')) {
          // console.log('observer thread: ', addedNode)
          links.thread = addedNode
        } else if (addedNode.classList?.contains('apa')) {
          console.log('no active thread')
          links.thread = null
        }
      })
    })
  })
  threadObserver.observe(threadHolder, {
    childList: true,
    subtree: false,
    attributes: false,
    // attributeFilter: [],
    characterData: false,
    attributeOldValue: false,
    characterDataOldValue: false,
  })
  // вставляем холдер для threadInfoBlock
  const holder = document.createElement('div')
  holder.className = 'threadInfoHolder'
  const threadMenu = links.category.querySelector('.aqL')
  threadMenu.after(holder)
  links.threadInfoHolder = holder
}

const threadId = computed(() => links.thread?.querySelector('h2.hP').getAttribute('data-legacy-thread-id') ?? null)
export const useGmailThreadId = () => threadId

export const findAllThreads = () => {
  // запускает поиск по e-mail клиента из активной цепочки
  const threadFrom = links.thread.querySelector('span.gD')?.getAttribute('email')
  const threadTo = links.thread.querySelector('span.g2')?.getAttribute('email')
  const clientMail = threadFrom === 'info@chelinstrument.ru' || threadFrom === 'meritel@mail.ru' ? threadTo : threadFrom
  const pressEnter = new KeyboardEvent('keydown', {
    keyCode: 13,
    bubbles: true,
    cancelable: true,
  })
  const searchInput = document.querySelector('input[aria-label="Поиск в почте"]')
  searchInput.value = clientMail
  searchInput.dispatchEvent(pressEnter)
}

export const goToAttachment = attachment => {
  console.log('goToAttachment: ', attachment)
}
