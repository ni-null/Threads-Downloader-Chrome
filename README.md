# Threads Video Downloader

[繁體中文](#繁體中文) | [English](#english)

---

## 繁體中文

### 下載 Threads 上的影片與圖片

Threads Video Downloader 是 Chrome 擴充功能，可讓您在瀏覽 Threads 時下載影片、圖片，或將一篇貼文截圖保存。

### 功能

- 下載單支影片或單張圖片
- 一次選取多個媒體並打包成 ZIP
- 以貼文內按鈕或外掛選單選取器儲存貼文截圖
- 自訂下載檔名的前綴
- 支援繁體中文、英文與其他常用介面語言

### 安裝方式

1. 前往 [Chrome Web Store](https://chrome.google.com/webstore)。
2. 搜尋 **Threads Video Downloader**。
3. 選取「新增至 Chrome」。

### 使用方式

1. 開啟 [Threads](https://www.threads.net) 的貼文。
2. 將游標移到影片或圖片上，或點擊瀏覽器工具列的擴充功能圖示。
3. 選擇要下載的媒體，然後點擊下載按鈕。
4. 多個檔案可選擇「打包下載」，一次儲存成 ZIP 檔案。

#### 儲存貼文截圖

可依使用情境選擇任一方式，兩者都會將貼文儲存為 PNG：

1. **貼文內快速截圖**：點擊貼文互動列中的截圖按鈕。
2. **外掛選單選取截圖**：開啟外掛選單，點擊「選取貼文截圖」，移到目標貼文後按左鍵截圖；按右鍵或 `Esc` 可取消。

若已開啟「添加截圖時間」，選取時會先預覽時間標記，輸出的圖片會將它置於右下角。

### 版本更新

**2.5.0**

- 偵測貼文文字中的 GIPHY GIF 與 WebP 圖片，納入相片分類，並支援單獨下載與 ZIP 打包，保留原始副檔名。
- 媒體清單新增淡色檔案格式標籤，依 GIF、MP4、JPG 和 WebP 顯示不同顏色，支援深色模式。
- 簡化全部下載按鈕的設計，並支援鍵盤操作及防止下載期間重複觸發。
- 評分提示改為低調的頁尾連結，關閉後七天內不再顯示。
- 移除音軌的固定大小限制，允許處理較小的音軌；沒有音軌時仍可下載無聲影片。

**2.4.0**

- 建立播放器 blob 與實際 CDN 音訊／影片軌的精確對應，改善多支影片同時載入時的預覽與下載正確性。
- 內嵌或引用貼文會分別建立下載按鈕與媒體選單，不再混入外層貼文的媒體。
- 輪播切換後會清理過期的覆蓋下載按鈕，避免下載到已被 React 回收的影片來源。
- 支援原本無聲的 DASH 影片：找不到音軌時會輸出純影片 MP4，不再直接下載失敗。
- 貼文截圖同時保留互動列按鈕與外掛選單選取器兩種方式；選取器可預覽右下角時間標記，並可用右鍵或 `Esc` 取消。
- 重新設計媒體下載選單，支援淺色／深色主題、固定右側的資訊分頁與底部評分連結。
- 媒體清單在資訊可取得時顯示影片長度、解析度與檔案大小，並調整全部下載按鈕與清單排版。
- 修正部分圖片的單一媒體下載按鈕在滑鼠移入後短暫出現又消失的問題。

**2.3.0**

- 統一貼文、媒體與互動功能列的判定流程：有媒體的貼文會加入媒體下載選單與截圖按鈕，沒有媒體的貼文只加入截圖按鈕。
- 改善 AJAX／React 動態載入的處理；媒體或互動列延後出現時，會在適當時機重新檢查並補上遺失的下載按鈕。
- 修正 React 重繪互動功能列後主下載按鈕未恢復、畫面只留下截圖按鈕的問題。
- 收緊互動列結構驗證，確保下載與截圖按鈕都掛在正確的原生按鈕列，並避免重複插入。

**2.2.0**

- 修復 Threads 登入後使用新播放器來源時，部分影片無法解析與下載的問題。
- 改善影片預覽與下載時的媒體來源匹配。

**2.1.0**

- 新增貼文截圖功能與檔名時間戳設定。
- 改善沒有媒體的貼文中，截圖按鈕偶爾重複顯示的情況。

### 隱私

媒體處理與下載都在您的瀏覽器中完成，不會將下載內容上傳到其他伺服器。

---

## English

### Download videos and images from Threads

Threads Video Downloader is a Chrome extension for saving videos, images, and post screenshots while you browse Threads.

### Features

- Download individual videos and images
- Save multiple media files in one ZIP archive
- Capture a post screenshot from the post button or the extension-menu picker
- Choose a filename prefix for downloads
- Available in English, Traditional Chinese, and other common interface languages

### Install

1. Open the [Chrome Web Store](https://chrome.google.com/webstore).
2. Search for **Threads Video Downloader**.
3. Select **Add to Chrome**.

### How to use

1. Open a post on [Threads](https://www.threads.net).
2. Hover over a video or image, or select the extension in the browser toolbar.
3. Choose the media you want and select the download button.
4. Choose the ZIP option when you want to save several files together.

#### Capture a post screenshot

Choose either option below; both save the post as a PNG:

1. **Quick capture from the post**: Select the screenshot button in the post action row.
2. **Picker from the extension menu**: Open the extension menu, select **Select Post to Screenshot**, then left-click the target post. Right-click or press `Esc` to cancel.

When **Add Screenshot Time** is enabled, the picker previews the timestamp and the saved image places it in the bottom-right corner.

### What's new

**2.5.0**

- Detect GIPHY GIF and WebP images in post text, include them in the images tab, and preserve their extensions for individual and ZIP downloads.
- Show softly colored GIF, MP4, JPG, and WebP format badges in the media list, including in dark mode.
- Simplified the download-all button, added keyboard support, and prevented repeated downloads while processing.
- Made the rating prompt less prominent and hide it for seven days after dismissal.
- Removed the fixed audio track size limit to allow smaller audio tracks; videos without audio can still be downloaded silently.

**2.4.0**

- Added exact blob-to-CDN audio/video track associations for more reliable previews and downloads when several videos load at once.
- Embedded and quoted posts now receive separate download controls and media menus instead of mixing with their parent post.
- Cleans up stale overlay controls after carousel changes, preventing downloads from React-recycled video sources.
- Silent DASH videos now download as video-only MP4 files when no audio track is available.
- Post screenshots retain both the in-post button and extension-menu picker; the picker previews the bottom-right timestamp and can be cancelled with right-click or `Esc`.
- Redesigned the media download menu with light and dark themes, a right-aligned information tab, and a rating link in the footer.
- Media items show video duration, resolution, and file size when available, with a more compact download-all button and list layout.
- Fixed single-image download buttons sometimes disappearing shortly after hover.

**2.3.0**

- Unified post, media, and action-row detection: posts with media receive the media download menu and screenshot button; posts without media receive only the screenshot button.
- Improved AJAX/React handling so delayed media or action rows are rechecked and missing download buttons are restored.
- Fixed the main download button not returning after React rerendered an action row, leaving only the screenshot button.
- Tightened native action-row validation to place extension buttons in the correct row and prevent duplicates.

**2.2.0**

- Fixed video detection and downloading for some posts that use Threads' newer signed-in player source.
- Improved media matching for video previews and downloads.

**2.1.0**

- Added post screenshots and screenshot filename timestamps.
- Fixed an occasional duplicate screenshot button on posts without media.

### Privacy

Media processing and downloads happen in your browser. Downloaded content is not uploaded to another server.
