import { computed, reactive } from 'vue'

// import { createApp } from 'vue'
// import TestDraft from '../components/TestDraft.vue'

const links = reactive({
  category: null,
  thread: null,
  threadInfoHolder: null,
})
export const useGmailLinks = () => links

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

export const initGmailLinks = async () => {
  // let mainNode = null // корневой элемент, который будем слушать
  // while (1) {
  //   await new Promise(resolve => setTimeout(resolve, 500))
  //   mainNode = document.querySelector('div.aeF > div.nH')
  //   if (mainNode !== null) break
  // }

  const mainNode = await getDomElementHelper('div.aeF > div.nH')
  if (!mainNode) return

  // проверяем на наличие активной категории
  links.category = mainNode.firstElementChild
  if (links.category) handleNewCategory()

  const observer = new MutationObserver(mutationRecords => {
    // console.log(mutationRecords)
    mutationRecords.forEach(mutation => {
      // console.log(mutation)
      mutation.addedNodes.forEach(async addedNode => {
        // console.log('addedNode: ', addedNode)
        // добавленный элемент автоматически становится основной категорией
        if (!addedNode.classList.contains('S4')) {
          // особое условие для поиска, который засовывает основную категорию внутрь добавленного элемента
          // await new Promise(resolve => setTimeout(resolve, 500)) // элементы добавляются асинхронно
          // links.category = addedNode.querySelector('.S4')
          links.category = await getDomElementHelper('.S4', addedNode)
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

export const goToAttachment = async attachment => {
  // если цепочка свернута, нужно предварить развернуть её
  const unfoldButton = links.thread.querySelector('button[aria-label="Развернуть все"]')
  if (unfoldButton) {
    unfoldButton.click()
    await new Promise(resolve => setTimeout(resolve, 400))
  }

  const message = links.thread.querySelector('.adn.ads[data-legacy-message-id="' + attachment.messId + '"]')
  const scrolledContainer = links.thread.parentNode.parentNode.parentNode.parentNode.parentNode

  const allAttachmentsLinks = message.querySelectorAll('.aQH > span > a > span')
  for (const attachmentLink of allAttachmentsLinks) {
    if (attachmentLink.textContent === 'Предварительный просмотр файла ' + attachment.name) {
      attachmentLink.parentNode.click()
      break
    }
  }

  // прокручиваем цепочку до нужного письмо
  // scrollIntoView работает некорректно, поэтому приходится делать руками
  scrolledContainer.scrollBy(
    0,
    message.getBoundingClientRect().bottom - scrolledContainer.getBoundingClientRect().bottom
  )
}

export const getOpenDraft = () => {
  return document.querySelector('.M9 .editable')
}

export const createTopPanelHolder = async () => {
  const searchBlock = await getDomElementHelper('.gb_we')
  const topPanelHolder = document.createElement('div')
  topPanelHolder.id = 'topPanelHolder'
  // insert after searchBlock
  searchBlock.after(topPanelHolder)
  return topPanelHolder
}

export const createTaskDraft = async () => {
  // создаем новое письмо
  const buttonNewEmail = await getDomElementHelper('.T-I.T-I-KE.L3')
  buttonNewEmail.click()
  // меняем отправителя с дефолтного на chelinstrument@gmail.com
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
  // вставляем в поле Кому chelinstrument@gmail.com
  const toInput = await getDomElementHelper('.agP.aFw')
  toInput.value = 'chelinstrument@gmail.com'
  // переводим фокус в поле Тема
  const subjectInput = await getDomElementHelper('.aoT')
  subjectInput.focus()
}
