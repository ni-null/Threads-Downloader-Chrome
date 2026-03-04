// 下載按鈕模組
window.ThreadsDownloaderButton = window.ThreadsDownloaderButton || {}

// 已處理的貼文容器（避免重複處理）
window.ThreadsDownloaderButton._processedPosts = window.ThreadsDownloaderButton._processedPosts || new WeakSet()

// 擴充功能上下文失效標誌
window.ThreadsDownloaderButton._contextInvalidated = false

// Debug 模式標誌（預設開啟以追蹤問題）
window.ThreadsDownloaderButton._debugMode = true

/**
 * i18n 輔助函數
 * @param {string} messageName - 訊息名稱
 * @param {string|string[]} substitutions - 替換參數
 * @returns {string} - 本地化後的字串
 */
function i18n(messageName, substitutions = null) {
  return window.ThreadsDownloaderUtils?.i18n(messageName, substitutions) || messageName
}

/**
 * Debug 日誌函數
 * @param {...any} args - 日誌參數
 */
function logDebug(...args) {
  if (window.ThreadsDownloaderButton._debugMode) {
    console.log('[ThreadsDownloader]', ...args)
  }
}

/**
 * 主要入口：在貼文旁邊添加下載按鈕
 * 新流程：
 * 1. 先檢測出貼文位置
 * 2. 檢測貼文後檢測是否包含媒體
 * 3. 如果有媒體在開始擷取內容並顯示按鈕
 * 4. 須考慮到貼文包覆問題（主貼文只判斷主貼文的內容，不應該判斷子貼文的內容）
 */
window.ThreadsDownloaderButton.addDownloadButtons = function () {
  // 如果上下文已失效,停止處理
  if (window.ThreadsDownloaderButton._contextInvalidated) {
    return
  }

  logDebug("addDownloadButtons called - 新流程")

  let buttonsAdded = 0

  // 步驟 1: 檢測所有貼文位置
  const posts = window.ThreadsDownloaderButton.findAllPosts()
  logDebug("找到貼文數量:", posts.length)

  posts.forEach((postData, index) => {
    const { postContainer, isMainPost, parentPost } = postData

    // 步驟 2: 檢測該貼文(僅限自身範圍)是否包含媒體
    const hasMedia = window.ThreadsDownloaderButton.checkPostHasDirectMedia(postContainer)
    const isProcessed = window.ThreadsDownloaderButton._processedPosts.has(postContainer)
    logDebug(`貼文 ${index + 1} - 是否為主貼文: ${isMainPost}, 是否有媒體: ${hasMedia}, 是否已處理: ${isProcessed}`)

    if (!hasMedia) {
      // 沒有媒體,跳過(不標記,因為媒體可能延遲載入)
      logDebug(`貼文 ${index + 1} - 跳過: 沒有媒體`)
      return
    }

    // 步驟 3: 找到該貼文的按鈕容器
    const btnContainer = window.ThreadsDownloaderButton.findButtonContainer(postContainer)

    if (!btnContainer) {
      logDebug(`貼文 ${index + 1} - 跳過: 找不到按鈕容器`)
      // 跳過(不標記,因為按鈕容器可能延遲出現)
      return
    }

    // 檢查是否已經有下載按鈕或包裝器
    const existingButton = btnContainer.querySelector(".threads-download-wrapper") || btnContainer.querySelector(".threads-download-btn")
    if (existingButton) {
      // 按鈕已存在,標記為已處理並跳過
      logDebug(`貼文 ${index + 1} - 跳過: 按鈕已存在`)
      window.ThreadsDownloaderButton._processedPosts.add(postContainer)
      return
    }

    // 檢查是否已經處理過(有按鈕容器且有媒體,但沒有按鈕,可能是上次創建失敗)
    if (window.ThreadsDownloaderButton._processedPosts.has(postContainer)) {
      // 已經嘗試處理過,跳過
      logDebug(`貼文 ${index + 1} - 跳過: 已在 WeakSet 中但按鈕不存在`)
      return
    }

    // 步驟 4: 創建下載按鈕
    logDebug(`貼文 ${index + 1} - 準備創建按鈕`)
    const downloadBtn = window.ThreadsDownloaderButton.createDownloadButton(btnContainer, postContainer)
    if (!downloadBtn) {
      // 創建失敗,標記為已處理避免重複嘗試
      logDebug(`貼文 ${index + 1} - 創建按鈕失敗(可能是上下文失效)`)
      window.ThreadsDownloaderButton._processedPosts.add(postContainer)
      // 檢查是否真的是上下文失效(嘗試調用 chrome API)
      try {
        chrome.runtime.getURL("test")
      } catch (e) {
        // 確認是上下文失效,設置全局標誌並停止
        logDebug("確認上下文已失效,停止所有處理")
        window.ThreadsDownloaderButton._contextInvalidated = true
        if (window.ThreadsDownloaderScanner && window.ThreadsDownloaderScanner._observer) {
          window.ThreadsDownloaderScanner._observer.disconnect()
          console.warn("Threads Downloader: 擴充功能已重新載入,請重新整理頁面以繼續使用")
        }
        return
      }
      return
    }
    window.ThreadsDownloaderButton._processedPosts.add(postContainer)
    buttonsAdded++
    logDebug(`貼文 ${index + 1} 成功添加下載按鈕`)
  })

  logDebug("本輪添加按鈕數:", buttonsAdded)
}

/**
 * 步驟 1: 找出頁面上所有的貼文
 * 策略：直接查詢 video/picture 媒體元素，向上遍歷找貼文容器
 * @returns {Array<{postContainer: HTMLElement, isMainPost: boolean, parentPost: HTMLElement|null}>}
 */
window.ThreadsDownloaderButton.findAllPosts = function () {
  const posts = []
  const seenContainers = new Set()

  logDebug('findAllPosts 開始 (媒體優先法)')

  const mediaElements = Array.from(document.querySelectorAll('video, picture'))
  logDebug('找到 ' + mediaElements.length + ' 個媒體元素')

  for (const media of mediaElements) {
    let current = media.parentElement
    let depth = 0
    let found = null

    while (current && depth < 25) {
      if (window.ThreadsDownloaderButton._looksLikePost(current)) {
        found = current
        break
      }
      current = current.parentElement
      depth++
    }

    if (found && !seenContainers.has(found)) {
      seenContainers.add(found)
      posts.push({
        postContainer: found,
        isMainPost: true,
        parentPost: null,
      })
      logDebug('找到貼文 (media: ' + media.tagName + ', 深度: ' + depth + ')')
    } else if (!found) {
      logDebug('媒體元素未找到貼文 (遍歷了 ' + depth + ' 層)')
    }
  }

  logDebug('共找到 ' + posts.length + ' 個貼文')
  return posts
}

/**
 * 判斷一個容器是否看起來像貼文
 * 特徵：內部有某個 div，其 3-5 個直接 div 子元素各自包含 SVG（讚、留言、轉發、分享）
 * @param {HTMLElement} container
 * @returns {boolean}
 */
window.ThreadsDownloaderButton._looksLikePost = function (container) {
  if (!container || !container.querySelectorAll) return false

  const allDivs = Array.from(container.querySelectorAll('div'))
  for (const div of allDivs) {
    // 計算直接 div 子元素中有包含 SVG 的數量
    const divChildrenWithSvg = Array.from(div.children).filter(function (child) {
      return child.tagName === 'DIV' && child.querySelector('svg') !== null
    })
    if (divChildrenWithSvg.length >= 3 && divChildrenWithSvg.length <= 5) {
      return true
    }
  }
  return false
}

/**
 * 從元素向上找到貼文容器
 * @param {HTMLElement} element
 * @returns {HTMLElement|null}
 */
window.ThreadsDownloaderButton.findPostContainerFromElement = function (element) {
  if (!element) return null

  // 優先找 article 或 role="article"
  const article = element.closest("article") || element.closest('[role="article"]')
  if (article) {
    return article
  }

  // 備用方案：向上找包含單一分享按鈕的最小容器
  const sharePathSnippet = "M15.6097 4.09082L6.65039 9.11104"
  let parent = element.parentElement
  let depth = 0

  while (parent && depth < 10) {
    // 計算此容器內的分享按鈕數量
    const shareButtons = Array.from(parent.querySelectorAll("svg")).filter((svg) => svg.innerHTML.includes(sharePathSnippet))

    // 如果只有一個分享按鈕，這可能是正確的貼文容器
    if (shareButtons.length === 1) {
      // 確認這個容器有一定的結構（不是太小的元素）
      if (parent.querySelector('video, picture, img[src*="cdninstagram"], img[src*="fbcdn"]') || parent.innerText?.length > 50) {
        return parent
      }
    }

    parent = parent.parentElement
    depth++
  }

  return null
}

/**
 * 找出貼文的父貼文（如果存在）
 * 用於判斷是否為子貼文
 * @param {HTMLElement} postContainer
 * @returns {HTMLElement|null}
 */
window.ThreadsDownloaderButton.findParentPost = function (postContainer) {
  if (!postContainer || !postContainer.parentElement) return null

  // 從父元素開始向上找
  let parent = postContainer.parentElement

  while (parent && parent !== document.body) {
    // 檢查是否為另一個貼文容器
    if ((parent.tagName === "ARTICLE" || parent.getAttribute("role") === "article") && parent !== postContainer) {
      return parent
    }
    parent = parent.parentElement
  }

  return null
}

/**
 * 步驟 2: 檢測貼文是否直接包含媒體（不包含子貼文的媒體）
 * @param {HTMLElement} postContainer
 * @returns {boolean} 
 */
window.ThreadsDownloaderButton.checkPostHasDirectMedia = function (postContainer) {
  if (!postContainer) return false

  // 找出所有嵌套的子貼文
  const nestedPosts = Array.from(postContainer.querySelectorAll('article, [role="article"]')).filter((article) => article !== postContainer)

  // 檢查元素是否屬於子貼文
  const isInNestedPost = (element) => {
    return nestedPosts.some((nested) => nested.contains(element))
  }

  // 檢查是否有直接的影片
  const videos = postContainer.querySelectorAll("video")
  for (const video of videos) {
    if (!isInNestedPost(video)) {
      const src = video.src || video.currentSrc || video.querySelector("source")?.src
      if (src && src !== "about:blank") {
        return true
      }
    }
  }

  // 檢查是否有直接的圖片（picture 標籤內的）
  const pictures = postContainer.querySelectorAll("picture")
  for (const picture of pictures) {
    if (!isInNestedPost(picture)) {
      const img = picture.querySelector("img")
      if (img) {
        const imgUrl = img.src || img.getAttribute("data-src")
        // 放寬尺寸檢查：如果圖片還沒載入完成，naturalWidth/Height 可能是 0
        // 只要 URL 符合條件就認為有媒體
        if (imgUrl && (imgUrl.includes("cdninstagram") || imgUrl.includes("fbcdn"))) {
          // 如果尺寸已載入，檢查是否大於最小尺寸；否則假設是有效圖片
          if (img.naturalWidth === 0 || (img.naturalWidth > 100 && img.naturalHeight > 100)) {
            return true
          }
        }
      }
    }
  }

  return false
}

/**
 * 步驟 3: 找到貼文的按鈕容器（用於放置下載按鈕）
 * 策略：找最深的那個 div，其 3-5 個直接 div 子元素各自包含 SVG（讚、留言、轉發、分享）
 * @param {HTMLElement} postContainer
 * @returns {HTMLElement|null}
 */
window.ThreadsDownloaderButton.findButtonContainer = function (postContainer) {
  if (!postContainer) return null

  logDebug('  搜尋按鈕容器...')

  // 判斷一個 div 是否是按鈕行（直接 div 子元素中有 3-5 個含 SVG）
  const isButtonRow = function (div) {
    const count = Array.from(div.children).filter(function (child) {
      return child.tagName === 'DIV' && child.querySelector('svg') !== null
    }).length
    return count >= 3 && count <= 5
  }

  // 從 postContainer 內所有 div 中找符合條件的，並取最深的（最後一個更具體的）
  // querySelectorAll 以文件順序返回，父層比子層先出現
  // 若一個 div 符合，且其子孫中還有符合的，代表這個 div 太廣，繼續往下
  const allDivs = Array.from(postContainer.querySelectorAll('div'))

  for (const div of allDivs) {
    if (!isButtonRow(div)) continue

    // 找到符合條件的 div，確認其子孫中是否還有更深的符合 div
    const deeperMatch = Array.from(div.querySelectorAll('div')).find(isButtonRow)
    if (!deeperMatch) {
      // 此 div 就是最深的按鈕行
      logDebug('  找到按鈕容器（無更深層匹配）')
      return div
    }
    // 有更深的，繼續掃描（外層 for loop 會遇到 deeperMatch）
  }

  // 備案：找最多 svg 的那個
  let bestGroup = null
  let bestCount = 0
  for (const div of allDivs) {
    const cnt = Array.from(div.children).filter(function (child) {
      return child.tagName === 'DIV' && child.querySelector('svg') !== null
    }).length
    if (cnt > bestCount && cnt >= 2) {
      bestCount = cnt
      bestGroup = div
    }
  }

  if (bestGroup) {
    logDebug('  使用備案按鈕容器 (' + bestCount + ' 個含 SVG 的 div 子元素)')
    return bestGroup
  }

  logDebug('  找不到按鈕容器')
  return null
}

// 創建下載按鈕
window.ThreadsDownloaderButton.createDownloadButton = function (btnContainer, postContainer) {
  const wrapper = document.createElement("div")
  wrapper.className = "threads-download-wrapper"
  wrapper.style.cssText = `
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 6px;
  `

  // 檢查擴充功能上下文是否有效
  let iconUrl
  try {
    iconUrl = chrome.runtime.getURL("image/download-black.svg")
  } catch (error) {
    console.warn("Threads Downloader: 擴充功能上下文已失效,請重新載入頁面")
    return null
  }

  const btn = document.createElement("button")
  btn.className = "threads-download-btn"
  btn.innerHTML = `<img src="${iconUrl}" alt="${i18n('downloadVideo')}" style="width: 18px; height: 18px; vertical-align: middle;">`
  btn.title = i18n("downloadVideo")
  btn.style.cssText = `
    padding: 6px 10px;
    border-radius: 20px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
  `

  // 滑鼠效果
  btn.addEventListener("mouseenter", () => {
    btn.style.background = "#F5F5F5"
  })
  btn.addEventListener("mouseleave", () => {
    btn.style.background = "transparent"
  })

  // 創建下拉選單
  const menu = document.createElement("div")
  menu.className = "threads-download-menu"
  menu.style.cssText = `
    display: none;
    position: fixed;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    padding: 8px 0;
    max-height: 400px;
    overflow-y: auto;
  `

  // 智慧定位：依據上下空間決定選單展開方向
  const positionMenu = () => {
    const btnRect = btn.getBoundingClientRect()
    const menuHeight = menu.offsetHeight
    const menuWidth = menu.offsetWidth || 280
    const spaceBelow = window.innerHeight - btnRect.bottom - 8
    const spaceAbove = btnRect.top - 8

    // 重置方向屬性，避免上次殘留
    menu.style.top = "auto"
    menu.style.bottom = "auto"

    if (spaceBelow >= menuHeight || spaceBelow >= spaceAbove) {
      // 下方空間足夠，或下方比上方多 → 往下展開
      menu.style.top = btnRect.bottom + 4 + "px"
    } else {
      // 下方不足且上方較寬裕 → 往上展開
      menu.style.bottom = window.innerHeight - btnRect.top + 4 + "px"
    }

    // 水平位置：確保不超出右側邊界
    let left = btnRect.left
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8
    }
    menu.style.left = Math.max(8, left) + "px"
  }

  // 點擊按鈕切換選單
  btn.addEventListener("click", (e) => {
    e.stopPropagation()

    // 關閉其他選單
    document.querySelectorAll(".threads-download-menu").forEach((m) => {
      if (m !== menu) m.style.display = "none"
    })

    // 切換當前選單
    if (menu.style.display === "none") {
      const media = window.ThreadsDownloaderButton.extractMediaFromPost(postContainer)
      window.ThreadsDownloaderButton.updateDownloadMenu(menu, media)

      // 先隱身顯示以取得實際高度，再決定展開方向
      menu.style.visibility = "hidden"
      menu.style.display = "block"
      positionMenu()
      menu.style.visibility = "visible"
    } else {
      menu.style.display = "none"
    }
  })

  wrapper.appendChild(btn)
  btnContainer.appendChild(wrapper)

  // 將選單掛載到 body 而不是 wrapper，確保不受父元素影響
  document.body.appendChild(menu)

  // 滾動時更新選單位置
  let scrollTimeout
  const updateMenuPosition = () => {
    if (menu.style.display === "block") {
      positionMenu()
    }
  }

  window.addEventListener(
    "scroll",
    () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(updateMenuPosition, 10)
    },
    true
  )

  // 點擊外部關閉選單
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = "none"
    }
  })

  return wrapper
}

// 從貼文中提取所有媒體（影片和相片）
// 使用統一的 media-extractor 模組
window.ThreadsDownloaderButton.extractMediaFromPost = function (postContainer) {
  // 使用統一提取模組
  return window.ThreadsMediaExtractor.extractFromPost(postContainer)
}

// 舊版函數保持兼容
window.ThreadsDownloaderButton.extractVideosFromPost = function (postContainer) {
  const media = window.ThreadsDownloaderButton.extractMediaFromPost(postContainer)
  return media.videos
}

// 更新下載選單（支援 tab 切換）
window.ThreadsDownloaderButton.updateDownloadMenu = function (menu, media) {
  const { i18n } = window.ThreadsDownloaderUtils
  
  // Debug: 輸出當前語言設定
  logDebug("=== 下載選單語言除錯資訊 ===")
  logDebug("當前語言:", window.ThreadsDownloaderUtils._currentLanguage)
  logDebug("語言檔案已載入:", window.ThreadsDownloaderUtils._messages ? "是" : "否")
  if (window.ThreadsDownloaderUtils._messages) {
    logDebug("測試 i18n('tabAll'):", i18n("tabAll", "5"))
    logDebug("測試 i18n('downloadAll'):", i18n("downloadAll", "5"))
    logDebug("測試 i18n('noMedia'):", i18n("noMedia"))
  }
  logDebug("=============================")
  
  menu.innerHTML = ""

  const totalCount = media.videos.length + media.images.length

  if (totalCount === 0) {
    const noMedia = document.createElement("div")
    noMedia.className = "threads-menu-no-media"
    noMedia.textContent = i18n("noMedia")
    noMedia.style.cssText = `
      padding: 12px 16px;
      color: #666;
      font-size: 14px;
      text-align: center;
    `
    menu.appendChild(noMedia)
    return
  }

  // Tab 容器
  // Tab 容器（包含 tab 和 info 圖示）
  const tabHeader = document.createElement("div")
  tabHeader.className = "threads-menu-tab-header"
  tabHeader.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #eee;
    padding: 0 8px;
  `

  const tabContainer = document.createElement("div")
  tabContainer.className = "threads-menu-tabs"
  tabContainer.style.cssText = `
    display: flex;
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
  `
  // Info 圖示按鈕
  const infoBtn = document.createElement("button")
  infoBtn.className = "threads-menu-info-btn"
  infoBtn.title = "應用程式資訊"
  let infoIconUrl = ""
  try {
    infoIconUrl = chrome.runtime.getURL("image/info-circle-svgrepo-com.svg")
  } catch (error) {
    infoIconUrl = ""
  }
  infoBtn.innerHTML = infoIconUrl
    ? `<img src="${infoIconUrl}" alt="info" style="width: 20px; height: 20px;">`
    : "ⓘ"
  infoBtn.style.cssText = `
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #666;
    padding: 8px 12px;
    transition: color 0.2s;
    flex-shrink: 0;
  `

  infoBtn.addEventListener("mouseenter", () => {
    infoBtn.style.color = "#667eea"
  })

  infoBtn.addEventListener("mouseleave", () => {
    infoBtn.style.color = "#666"
  })

  infoBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    window.ThreadsModalInfo.showModal()
  })

  // 創建 tab（只顯示有內容的 tab）
  const tabs = []
  tabs.push({ id: "all", label: i18n("tabAll", String(totalCount)), filter: "all" })
  if (media.videos.length > 0) {
    tabs.push({ id: "videos", label: i18n("tabVideos", String(media.videos.length)), filter: "video" })
  }
  if (media.images.length > 0) {
    tabs.push({ id: "images", label: i18n("tabImages", String(media.images.length)), filter: "image" })
  }

  let activeTab = "all"
  const contentContainer = document.createElement("div")
  contentContainer.className = "threads-menu-content"
  contentContainer.style.cssText = `
    max-height: 350px;
    overflow-y: auto;
  `

  // 渲染內容的函數
  const renderContent = (filter) => {
    contentContainer.innerHTML = ""
    let items = []

    if (filter === "all") {
      items = [...media.videos, ...media.images]
    } else if (filter === "video") {
      items = media.videos
    } else if (filter === "image") {
      items = media.images
    }

    // 如果有檔案，在頂部添加打包下載按鈕（所有 tab 都支持）
    if (items.length >= 1) {
      const downloadAllBtn = document.createElement("div")
      downloadAllBtn.className = "threads-download-all-btn"
      
      // 檢查擴充功能上下文是否有效
      let packageIconUrl = ""
      try {
        packageIconUrl = chrome.runtime.getURL("image/package-white.svg")
      } catch (error) {
        console.warn("Threads Downloader: 擴充功能上下文已失效")
      }
      
      downloadAllBtn.style.cssText = `
        margin: 8px;
        padding: 12px 16px;
        background: #000;
        color: white;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        text-align: center;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      `
      downloadAllBtn.innerHTML = `<img src="${packageIconUrl}" alt="package" style="width: 20px; height: 20px;"> ${i18n("downloadAll", String(items.length))}`

      downloadAllBtn.addEventListener("click", async (e) => {
        e.stopPropagation()
        await window.ThreadsDownloaderButton.downloadAllAsZip(items, downloadAllBtn, filter)
      })

      contentContainer.appendChild(downloadAllBtn)
    }

    if (items.length === 0) {
      const empty = document.createElement("div")
      empty.className = "threads-menu-empty"
      empty.textContent = filter === "video" ? i18n("noVideos") : filter === "image" ? i18n("noImages") : i18n("noMedia")
      empty.style.cssText = `
        padding: 20px;
        text-align: center;
        color: #999;
        font-size: 14px;
      `
      contentContainer.appendChild(empty)
      return
    }

    items.forEach((item) => {
      const mediaItem = window.ThreadsDownloaderButton.createMediaItem(contentContainer, item, menu)
      // 如果創建失敗(擴充功能上下文失效),跳過
      if (!mediaItem) return
    })
  }

  // 創建 tab 按鈕
  tabs.forEach((tab) => {
    const tabBtn = document.createElement("div")
    tabBtn.className = `threads-menu-tab threads-menu-tab-${tab.id}`
    tabBtn.textContent = tab.label
    tabBtn.style.cssText = `
      padding: 10px 16px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
      color: #666;
      user-select: none;
      white-space: nowrap;
      flex-shrink: 0;
    `

    if (tab.id === activeTab) {
      tabBtn.style.color = "#667eea"
      tabBtn.style.borderBottomColor = "#667eea"
    }

    // Hover 效果
    tabBtn.addEventListener("mouseenter", () => {
      if (tab.id !== activeTab) {
        tabBtn.style.color = "#333"
      }
    })

    tabBtn.addEventListener("mouseleave", () => {
      if (tab.id !== activeTab) {
        tabBtn.style.color = "#666"
      }
    })

    tabBtn.addEventListener("click", (e) => {
      e.stopPropagation() // 防止冒泡導致選單關閉
      activeTab = tab.id

      // 更新所有 tab 樣式
      Array.from(tabContainer.children).forEach((child, i) => {
        if (tabs[i].id === activeTab) {
          child.style.color = "#667eea"
          child.style.borderBottomColor = "#667eea"
        } else {
          child.style.color = "#666"
          child.style.borderBottomColor = "transparent"
        }
      })

      // 渲染對應內容
      renderContent(tab.filter)
    })

    tabContainer.appendChild(tabBtn)
  })

  tabHeader.appendChild(tabContainer)
  tabHeader.appendChild(infoBtn)

  menu.appendChild(tabHeader)
  menu.appendChild(contentContainer)

  // 初始渲染
  renderContent("all")
}

// 創建單個媒體項目
window.ThreadsDownloaderButton.createMediaItem = function (container, item, menu) {
  const { findPostInfoFromElement } = window.ThreadsDownloaderUtils

  // 檢查擴充功能上下文是否有效
  let downloadIconUrl
  try {
    downloadIconUrl = chrome.runtime.getURL("image/download-white.svg")
  } catch (error) {
    console.warn("Threads Downloader: 擴充功能上下文已失效")
    return null
  }

  // 使用統一的檔名生成器
  const filename = window.ThreadsFilenameGenerator.generateFilenameFromElement({
    element: item.postContainer || item.element,
    type: item.type,
    index: item.index,
    useTimestamp: false, // 下載按鈕不使用時間戳
    addPrefix: window.ThreadsDownloaderButton._enableFilenamePrefix !== false, // 從設定讀取
  })

  // 創建項目元素
  const itemDiv = document.createElement("div")
  itemDiv.className = `threads-menu-item threads-menu-item-${item.type}`
  itemDiv.style.cssText = `
    padding: 10px 16px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
  `

  // 縮圖容器
  const thumbnailContainer = document.createElement("div")
  thumbnailContainer.className = "threads-item-thumbnail"
  thumbnailContainer.style.cssText = `
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    cursor: pointer;
  `

  // 創建預覽彈窗（hover 時顯示）
  const previewOverlay = document.createElement("div")
  previewOverlay.className = "threads-preview-overlay"
  previewOverlay.style.cssText = `
    display: none;
    position: fixed;
    z-index: 9999999;
    pointer-events: none;
  `

  // Hover 事件 - 顯示預覽
  let previewTimeout
  thumbnailContainer.addEventListener("mouseenter", (e) => {
    previewTimeout = setTimeout(() => {
      const rect = thumbnailContainer.getBoundingClientRect()

      // 創建預覽內容
      previewOverlay.innerHTML = ""

      if (item.type === "video") {
        // 影片預覽
        const video = document.createElement("video")
        video.src = item.url
        video.autoplay = true
        video.loop = true
        video.muted = true
        video.style.cssText = `
          max-width: 400px;
          max-height: 400px;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          background: #000;
        `
        previewOverlay.appendChild(video)
      } else {
        // 圖片預覽
        const img = document.createElement("img")
        img.src = item.url
        img.style.cssText = `
          max-width: 400px;
          max-height: 400px;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        `
        previewOverlay.appendChild(img)
      }

      // 定位預覽窗口（在縮圖右上角，預覽窗口的左下角對齊縮圖）
      const leftPosition = rect.right + 10
      const bottomPosition = rect.bottom

      // 檢查是否超出視窗右側
      if (leftPosition + 400 > window.innerWidth) {
        // 顯示在左側
        previewOverlay.style.left = rect.left - 410 + "px"
      } else {
        previewOverlay.style.left = leftPosition + "px"
      }

      // 設置預覽窗口的底部與縮圖底部對齊（預覽在上方）
      previewOverlay.style.bottom = window.innerHeight - bottomPosition + "px"
      previewOverlay.style.top = "auto"
      previewOverlay.style.display = "block"
      document.body.appendChild(previewOverlay)
    }, 300) // 延遲 300ms 再顯示
  })

  thumbnailContainer.addEventListener("mouseleave", () => {
    clearTimeout(previewTimeout)
    previewOverlay.style.display = "none"
    if (previewOverlay.parentElement) {
      document.body.removeChild(previewOverlay)
    }
  })

  // 判斷是否有縮圖
  const posterUrl = item.type === "video" ? item.poster || "" : item.thumbnail

  if (posterUrl) {
    // 有縮圖 URL，直接使用
    logDebug("[選單縮圖] 直接使用 URL:", posterUrl)
    const thumbnail = document.createElement("img")
    thumbnail.src = posterUrl
    thumbnail.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `
    thumbnailContainer.appendChild(thumbnail)
    itemDiv.appendChild(thumbnailContainer)
  } else {
    // 沒有縮圖，顯示圖標（不使用提取模式）
    logDebug("[選單縮圖] 沒有 poster URL，顯示圖標")
    const icon = document.createElement("span")
    icon.textContent = item.type === "video" ? "🎬" : "🖼️"
    icon.style.fontSize = "20px"
    thumbnailContainer.appendChild(icon)
    itemDiv.appendChild(thumbnailContainer)
  }

  // 標籤 - 顯示檔案名稱（分離檔名和副檔名）
  const label = document.createElement("span")
  label.className = "threads-item-label"
  label.style.cssText = `
    flex: 1;
    overflow: hidden;
    font-size: 12px;
    display: flex;
    align-items: center;
  `
  label.title = filename // 滑鼠懸停時顯示完整檔名
  
  // 分離檔名和副檔名
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex > 0) {
    const nameWithoutExt = filename.substring(0, lastDotIndex)
    const extension = filename.substring(lastDotIndex) // 包含 "."
    
    // 檔名部分（可省略）
    const nameSpan = document.createElement("span")
    nameSpan.textContent = nameWithoutExt
    nameSpan.style.cssText = `
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex-shrink: 1;
    `
    
    // 副檔名部分（固定顯示）
    const extSpan = document.createElement("span")
    extSpan.textContent = extension
    extSpan.style.cssText = `
      flex-shrink: 0;
      white-space: nowrap;
    `
    
    label.appendChild(nameSpan)
    label.appendChild(extSpan)
  } else {
    // 沒有副檔名，直接顯示
    label.textContent = filename
    label.style.cssText += `
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `
  }
  itemDiv.appendChild(label)

  // 下載圖標
  const downloadIcon = document.createElement("span")
  downloadIcon.className = "threads-item-download-icon"
  downloadIcon.innerHTML = `<img src="${downloadIconUrl}" alt="下載" style="width: 12px; height: 12px;">`
  itemDiv.appendChild(downloadIcon)

  // 事件監聽
  itemDiv.addEventListener("mouseenter", () => {
    itemDiv.style.background = "#f5f5f5"
  })

  itemDiv.addEventListener("mouseleave", () => {
    itemDiv.style.background = "transparent"
  })

  itemDiv.addEventListener("click", (e) => {
    e.stopPropagation()

    // 使用 Chrome Downloads API 下載
    chrome.runtime.sendMessage(
      {
        action: "downloadVideo",
        url: item.url,
        filename: filename,
      },
      (response) => {
        if (response && response.success) {
          itemDiv.style.background = "#e8f5e9"
          downloadIcon.textContent = "✅"

          const { showPageNotification, i18n } = window.ThreadsDownloaderUtils
          let downloadIconUrl = ""
          try {
            downloadIconUrl = chrome.runtime.getURL("image/download-white.svg")
          } catch (error) {
            console.warn("Threads Downloader: 擴充功能上下文已失效")
          }
          showPageNotification(`<img src="${downloadIconUrl}" alt="download" style="width: 16px; height: 16px;"> ${i18n("downloadStarted", filename)}`)

          setTimeout(() => {
            itemDiv.style.background = "transparent"
            downloadIcon.innerHTML = `<img src="${downloadIconUrl}" alt="下載" style="width: 12px; height: 12px;">`
          }, 1500)
        } else {
          itemDiv.style.background = "#ffebee"
          downloadIcon.textContent = "❌"

          const { showPageNotification, i18n } = window.ThreadsDownloaderUtils
          showPageNotification(i18n("downloadFailed", filename))

          setTimeout(() => {
            itemDiv.style.background = "transparent"
            downloadIcon.textContent = "⬇️"
          }, 2000)
        }
      }
    )

    menu.style.display = "none"
  })

  container.appendChild(itemDiv)
  return itemDiv
}

// 打包下載所有媒體為 ZIP
window.ThreadsDownloaderButton.downloadAllAsZip = async function (items, buttonElement, tabType = "all") {
  const { findPostInfoFromElement, showPageNotification, i18n } = window.ThreadsDownloaderUtils

  // 檢查 JSZip 是否可用
  if (typeof JSZip === "undefined") {
    showPageNotification("❌ " + i18n("jsZipNotLoaded"))
    return
  }

  // 更新按鈕狀態
  const originalText = buttonElement.innerHTML
  buttonElement.style.pointerEvents = "none"
  buttonElement.style.opacity = "0.7"

  // 預先取得圖示 URL
  let packageIconUrl = ""
  try {
    packageIconUrl = chrome.runtime.getURL("image/package-white.svg")
  } catch (error) {
    console.warn("Threads Downloader: 擴充功能上下文已失效")
  }

  try {
    const zip = new JSZip()
    let completed = 0
    const total = items.length

    // 取得貼文資訊用於 ZIP 檔名
    const postInfo = findPostInfoFromElement(items[0].postContainer || items[0].element)
    
    // 使用統一的 ZIP 檔名生成器，傳入 tab 類型
    const zipFilename = window.ThreadsFilenameGenerator.generateZipFilename(
      postInfo,
      window.ThreadsDownloaderButton._enableFilenamePrefix !== false,  // 從設定讀取
      tabType  // 傳入 tab 類型 ('all', 'video', 'image')
    )

    buttonElement.innerHTML = `⏳ ${i18n("downloadProgress", ["0", String(total)])}`

    // 逐個下載並添加到 ZIP
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // 使用統一的檔名生成器（與設定同步）
      const filename = window.ThreadsFilenameGenerator.generateFilename({
        type: item.type,
        index: item.index,
        postInfo: postInfo,
        useTimestamp: false,
        addPrefix: window.ThreadsDownloaderButton._enableFilenamePrefix !== false  // 從設定讀取
      })

      try {
        // 使用 fetch 下載檔案
        const response = await fetch(item.url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const blob = await response.blob()
        zip.file(filename, blob)

        completed++
        buttonElement.innerHTML = `⏳ ${i18n("downloadProgress", [String(completed), String(total)])}`
      } catch (error) {
        console.error(`下載失敗: ${filename}`, error)
        // 繼續處理其他檔案
      }
    }

    if (completed === 0) {
      throw new Error(i18n("allFilesFailed"))
    }

    // 生成 ZIP
    buttonElement.innerHTML = `📦 ${i18n("packaging")}`
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    })

    // 觸發下載
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = zipFilename
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // 成功提示
    buttonElement.innerHTML = `<img src="${packageIconUrl}" alt="package" style="width: 20px; height: 20px;"> ${i18n("completed", [String(completed), String(total)])}`
    showPageNotification(`<img src="${packageIconUrl}" alt="package" style="width: 16px; height: 16px;"> ${i18n("zipDownloaded", [String(completed), zipFilename])}`)

    setTimeout(() => {
      buttonElement.innerHTML = originalText
      buttonElement.style.pointerEvents = "auto"
      buttonElement.style.opacity = "1"
    }, 2000)
  } catch (error) {
    console.error("打包下載失敗:", error)
    buttonElement.innerHTML = `❌ ${i18n("failed")}`
    showPageNotification("❌ " + i18n("zipFailed", error.message))

    setTimeout(() => {
      buttonElement.innerHTML = originalText
      buttonElement.style.pointerEvents = "auto"
      buttonElement.style.opacity = "1"
    }, 2000)
  }
}

// 下載影片（保留供其他模組調用）
window.ThreadsDownloaderButton.downloadVideoFromPage = function (url, filename) {
  const { showPageNotification, i18n } = window.ThreadsDownloaderUtils
  // 創建隱藏的 a 標籤下載
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  // 顯示通知
  showPageNotification(i18n("downloadStarted", filename))
}
