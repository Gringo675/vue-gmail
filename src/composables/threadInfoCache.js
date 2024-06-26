const cache = {}

export const setToCache = (threadId, data) => {
  cache[threadId] = {
    attachments: [...data.attachments],
    bills: [...data.bills],
    notice: data.notice,
    otherThreads: data.otherThreads,
  }
}

export const getFromCache = threadId => cache[threadId]
