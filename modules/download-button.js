(()=>{window.ThreadsDownloaderButton=window.ThreadsDownloaderButton||{};window.ThreadsDownloaderButton._processedPosts=window.ThreadsDownloaderButton._processedPosts||new WeakSet;window.ThreadsDownloaderButton._contextInvalidated=!1;window.ThreadsDownloaderButton._debugMode=!0;function v(r,t=null){return window.ThreadsDownloaderUtils?.i18n(r,t)||r}function p(...r){window.ThreadsDownloaderButton._debugMode&&console.log("[ThreadsDownloader]",...r)}window.ThreadsDownloaderButton.addDownloadButtons=function(){if(window.ThreadsDownloaderButton._contextInvalidated)return;p("addDownloadButtons called - \u65B0\u6D41\u7A0B");let r=0;const t=window.ThreadsDownloaderButton.findAllPosts();p("\u627E\u5230\u8CBC\u6587\u6578\u91CF:",t.length),t.forEach((a,s)=>{const{postContainer:o,isMainPost:e,parentPost:n}=a,d=window.ThreadsDownloaderButton.checkPostHasDirectMedia(o),u=window.ThreadsDownloaderButton._processedPosts.has(o);if(p(`\u8CBC\u6587 ${s+1} - \u662F\u5426\u70BA\u4E3B\u8CBC\u6587: ${e}, \u662F\u5426\u6709\u5A92\u9AD4: ${d}, \u662F\u5426\u5DF2\u8655\u7406: ${u}`),!d){p(`\u8CBC\u6587 ${s+1} - \u8DF3\u904E: \u6C92\u6709\u5A92\u9AD4`);return}const w=window.ThreadsDownloaderButton.findButtonContainer(o);if(!w){p(`\u8CBC\u6587 ${s+1} - \u8DF3\u904E: \u627E\u4E0D\u5230\u6309\u9215\u5BB9\u5668`);return}if(w.querySelector(".threads-download-wrapper")||w.querySelector(".threads-download-btn")){p(`\u8CBC\u6587 ${s+1} - \u8DF3\u904E: \u6309\u9215\u5DF2\u5B58\u5728`),window.ThreadsDownloaderButton._processedPosts.add(o);return}if(window.ThreadsDownloaderButton._processedPosts.has(o)){p(`\u8CBC\u6587 ${s+1} - \u8DF3\u904E: \u5DF2\u5728 WeakSet \u4E2D\u4F46\u6309\u9215\u4E0D\u5B58\u5728`);return}if(p(`\u8CBC\u6587 ${s+1} - \u6E96\u5099\u5275\u5EFA\u6309\u9215`),!window.ThreadsDownloaderButton.createDownloadButton(w,o)){p(`\u8CBC\u6587 ${s+1} - \u5275\u5EFA\u6309\u9215\u5931\u6557(\u53EF\u80FD\u662F\u4E0A\u4E0B\u6587\u5931\u6548)`),window.ThreadsDownloaderButton._processedPosts.add(o);try{chrome.runtime.getURL("test")}catch{p("\u78BA\u8A8D\u4E0A\u4E0B\u6587\u5DF2\u5931\u6548,\u505C\u6B62\u6240\u6709\u8655\u7406"),window.ThreadsDownloaderButton._contextInvalidated=!0,window.ThreadsDownloaderScanner&&window.ThreadsDownloaderScanner._observer&&(window.ThreadsDownloaderScanner._observer.disconnect(),console.warn("Threads Downloader: \u64F4\u5145\u529F\u80FD\u5DF2\u91CD\u65B0\u8F09\u5165,\u8ACB\u91CD\u65B0\u6574\u7406\u9801\u9762\u4EE5\u7E7C\u7E8C\u4F7F\u7528"));return}return}window.ThreadsDownloaderButton._processedPosts.add(o),r++,p(`\u8CBC\u6587 ${s+1} \u6210\u529F\u6DFB\u52A0\u4E0B\u8F09\u6309\u9215`)}),p("\u672C\u8F2A\u6DFB\u52A0\u6309\u9215\u6578:",r)};window.ThreadsDownloaderButton.findAllPosts=function(){const r=[],t=new Set;p("findAllPosts \u958B\u59CB (\u5A92\u9AD4\u512A\u5148\u6CD5)");const a=Array.from(document.querySelectorAll("video, picture"));p("\u627E\u5230 "+a.length+" \u500B\u5A92\u9AD4\u5143\u7D20");for(const s of a){let o=s.parentElement,e=0,n=null;for(;o&&e<25;){if(window.ThreadsDownloaderButton._looksLikePost(o)){n=o;break}o=o.parentElement,e++}n&&!t.has(n)?(t.add(n),r.push({postContainer:n,isMainPost:!0,parentPost:null}),p("\u627E\u5230\u8CBC\u6587 (media: "+s.tagName+", \u6DF1\u5EA6: "+e+")")):n||p("\u5A92\u9AD4\u5143\u7D20\u672A\u627E\u5230\u8CBC\u6587 (\u904D\u6B77\u4E86 "+e+" \u5C64)")}return p("\u5171\u627E\u5230 "+r.length+" \u500B\u8CBC\u6587"),r};window.ThreadsDownloaderButton._looksLikePost=function(r){if(!r||!r.querySelectorAll)return!1;const t=Array.from(r.querySelectorAll("div"));for(const a of t){const s=Array.from(a.children).filter(function(o){return o.tagName==="DIV"&&o.querySelector("svg")!==null});if(s.length>=3&&s.length<=5)return!0}return!1};window.ThreadsDownloaderButton.findPostContainerFromElement=function(r){if(!r)return null;const t=r.closest("article")||r.closest('[role="article"]');if(t)return t;const a="M15.6097 4.09082L6.65039 9.11104";let s=r.parentElement,o=0;for(;s&&o<10;){if(Array.from(s.querySelectorAll("svg")).filter(n=>n.innerHTML.includes(a)).length===1&&(s.querySelector('video, picture, img[src*="cdninstagram"], img[src*="fbcdn"]')||s.innerText?.length>50))return s;s=s.parentElement,o++}return null};window.ThreadsDownloaderButton.findParentPost=function(r){if(!r||!r.parentElement)return null;let t=r.parentElement;for(;t&&t!==document.body;){if((t.tagName==="ARTICLE"||t.getAttribute("role")==="article")&&t!==r)return t;t=t.parentElement}return null};window.ThreadsDownloaderButton.checkPostHasDirectMedia=function(r){if(!r)return!1;const t=Array.from(r.querySelectorAll('article, [role="article"]')).filter(e=>e!==r),a=e=>t.some(n=>n.contains(e)),s=r.querySelectorAll("video");for(const e of s)if(!a(e)){const n=e.src||e.currentSrc||e.querySelector("source")?.src;if(n&&n!=="about:blank")return!0}const o=r.querySelectorAll("picture");for(const e of o)if(!a(e)){const n=e.querySelector("img");if(n){const d=n.src||n.getAttribute("data-src");if(d&&(d.includes("cdninstagram")||d.includes("fbcdn"))&&(n.naturalWidth===0||n.naturalWidth>100&&n.naturalHeight>100))return!0}}return!1};window.ThreadsDownloaderButton.findButtonContainer=function(r){if(!r)return null;p("  \u641C\u5C0B\u6309\u9215\u5BB9\u5668...");const t=function(e){const n=Array.from(e.children).filter(function(d){return d.tagName==="DIV"&&d.querySelector("svg")!==null}).length;return n>=3&&n<=5},a=Array.from(r.querySelectorAll("div"));for(const e of a){if(!t(e))continue;if(!Array.from(e.querySelectorAll("div")).find(t))return p("  \u627E\u5230\u6309\u9215\u5BB9\u5668\uFF08\u7121\u66F4\u6DF1\u5C64\u5339\u914D\uFF09"),e}let s=null,o=0;for(const e of a){const n=Array.from(e.children).filter(function(d){return d.tagName==="DIV"&&d.querySelector("svg")!==null}).length;n>o&&n>=2&&(o=n,s=e)}return s?(p("  \u4F7F\u7528\u5099\u6848\u6309\u9215\u5BB9\u5668 ("+o+" \u500B\u542B SVG \u7684 div \u5B50\u5143\u7D20)"),s):(p("  \u627E\u4E0D\u5230\u6309\u9215\u5BB9\u5668"),null)};window.ThreadsDownloaderButton.createDownloadButton=function(r,t){const a=document.createElement("div");a.className="threads-download-wrapper",a._threadsPostContainer=t,a.style.cssText=`
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 2px;
    margin-left: 6px;
  `;let s;try{s=chrome.runtime.getURL("image/download-black.svg")}catch{return console.warn("Threads Downloader: \u64F4\u5145\u529F\u80FD\u4E0A\u4E0B\u6587\u5DF2\u5931\u6548,\u8ACB\u91CD\u65B0\u8F09\u5165\u9801\u9762"),null}const o=document.createElement("button");o.className="threads-download-btn",o.innerHTML=`<img src="${s}" alt="${v("downloadVideo")}" style="width: 18px; height: 18px; vertical-align: middle;">`,o.title=v("downloadVideo"),o.style.cssText=`
    padding: 6px 10px;
    border-radius: 20px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
  `,o.addEventListener("mouseenter",()=>{o.style.background="#F5F5F5"}),o.addEventListener("mouseleave",()=>{o.style.background="transparent"});const e=document.createElement("div");e.className="threads-download-menu",e.style.cssText=`
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
  `;const n=()=>{const w=o.getBoundingClientRect(),m=e.offsetHeight,g=e.offsetWidth||280,l=window.innerHeight-w.bottom-8,c=w.top-8;e.style.top="auto",e.style.bottom="auto",l>=m||l>=c?e.style.top=w.bottom+4+"px":e.style.bottom=window.innerHeight-w.top+4+"px";let i=w.left;i+g>window.innerWidth-8&&(i=window.innerWidth-g-8),e.style.left=Math.max(8,i)+"px"};o.addEventListener("click",w=>{if(w.stopPropagation(),document.querySelectorAll(".threads-download-menu").forEach(m=>{m!==e&&(m.style.display="none")}),e.style.display==="none"){const m=window.ThreadsDownloaderButton.extractMediaFromPost(t);window.ThreadsDownloaderButton.updateDownloadMenu(e,m),e.style.visibility="hidden",e.style.display="block",n(),e.style.visibility="visible"}else e.style.display="none"}),a.appendChild(o),r.appendChild(a),document.body.appendChild(e);let d;const u=()=>{e.style.display==="block"&&n()};return window.addEventListener("scroll",()=>{clearTimeout(d),d=setTimeout(u,10)},!0),document.addEventListener("click",w=>{!a.contains(w.target)&&!e.contains(w.target)&&(e.style.display="none")}),a};window.ThreadsDownloaderButton.extractMediaFromPost=function(r){return window.ThreadsMediaExtractor.extractFromPost(r)};window.ThreadsDownloaderButton.extractVideosFromPost=function(r){return window.ThreadsDownloaderButton.extractMediaFromPost(r).videos};window.ThreadsDownloaderButton.updateDownloadMenu=function(r,t){const{i18n:a}=window.ThreadsDownloaderUtils;p("=== \u4E0B\u8F09\u9078\u55AE\u8A9E\u8A00\u9664\u932F\u8CC7\u8A0A ==="),p("\u7576\u524D\u8A9E\u8A00:",window.ThreadsDownloaderUtils._currentLanguage),p("\u8A9E\u8A00\u6A94\u6848\u5DF2\u8F09\u5165:",window.ThreadsDownloaderUtils._messages?"\u662F":"\u5426"),window.ThreadsDownloaderUtils._messages&&(p("\u6E2C\u8A66 i18n('tabAll'):",a("tabAll","5")),p("\u6E2C\u8A66 i18n('downloadAll'):",a("downloadAll","5")),p("\u6E2C\u8A66 i18n('noMedia'):",a("noMedia"))),p("============================="),r.innerHTML="";const s=t.videos.length+t.images.length;if(s===0){const l=document.createElement("div");l.className="threads-menu-no-media",l.textContent=a("noMedia"),l.style.cssText=`
      padding: 12px 16px;
      color: #666;
      font-size: 14px;
      text-align: center;
    `,r.appendChild(l);return}const o=document.createElement("div");o.className="threads-menu-tab-header",o.style.cssText=`
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #eee;
    padding: 0 8px;
  `;const e=document.createElement("div");e.className="threads-menu-tabs",e.style.cssText=`
    display: flex;
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
  `;const n=document.createElement("button");n.className="threads-menu-info-btn",n.title="\u61C9\u7528\u7A0B\u5F0F\u8CC7\u8A0A";let d="";try{d=chrome.runtime.getURL("image/info-circle-svgrepo-com.svg")}catch{d=""}n.innerHTML=d?`<img src="${d}" alt="info" style="width: 20px; height: 20px;">`:"\u24D8",n.style.cssText=`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #666;
    padding: 8px 12px;
    transition: color 0.2s;
    flex-shrink: 0;
  `,n.addEventListener("mouseenter",()=>{n.style.color="#667eea"}),n.addEventListener("mouseleave",()=>{n.style.color="#666"}),n.addEventListener("click",l=>{l.stopPropagation(),window.ThreadsModalInfo.showModal()});const u=[];u.push({id:"all",label:a("tabAll",String(s)),filter:"all"}),t.videos.length>0&&u.push({id:"videos",label:a("tabVideos",String(t.videos.length)),filter:"video"}),t.images.length>0&&u.push({id:"images",label:a("tabImages",String(t.images.length)),filter:"image"});let w="all";const m=document.createElement("div");m.className="threads-menu-content",m.style.cssText=`
    max-height: 350px;
    overflow-y: auto;
  `;const g=l=>{m.innerHTML="";let c=[];if(l==="all"?c=[...t.videos,...t.images]:l==="video"?c=t.videos:l==="image"&&(c=t.images),c.length>=1){const i=document.createElement("div");i.className="threads-download-all-btn";let h="";try{h=chrome.runtime.getURL("image/package-white.svg")}catch{console.warn("Threads Downloader: \u64F4\u5145\u529F\u80FD\u4E0A\u4E0B\u6587\u5DF2\u5931\u6548")}i.style.cssText=`
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
      `,i.innerHTML=`<img src="${h}" alt="package" style="width: 20px; height: 20px;"> ${a("downloadAll",String(c.length))}`,i.addEventListener("click",async f=>{f.stopPropagation(),await window.ThreadsDownloaderButton.downloadAllAsZip(c,i,l)}),m.appendChild(i)}if(c.length===0){const i=document.createElement("div");i.className="threads-menu-empty",i.textContent=a(l==="video"?"noVideos":l==="image"?"noImages":"noMedia"),i.style.cssText=`
        padding: 20px;
        text-align: center;
        color: #999;
        font-size: 14px;
      `,m.appendChild(i);return}c.forEach(i=>{window.ThreadsDownloaderButton.createMediaItem(m,i,r)})};u.forEach(l=>{const c=document.createElement("div");c.className=`threads-menu-tab threads-menu-tab-${l.id}`,c.textContent=l.label,c.style.cssText=`
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
    `,l.id===w&&(c.style.color="#667eea",c.style.borderBottomColor="#667eea"),c.addEventListener("mouseenter",()=>{l.id!==w&&(c.style.color="#333")}),c.addEventListener("mouseleave",()=>{l.id!==w&&(c.style.color="#666")}),c.addEventListener("click",i=>{i.stopPropagation(),w=l.id,Array.from(e.children).forEach((h,f)=>{u[f].id===w?(h.style.color="#667eea",h.style.borderBottomColor="#667eea"):(h.style.color="#666",h.style.borderBottomColor="transparent")}),g(l.filter)}),e.appendChild(c)}),o.appendChild(e),o.appendChild(n),r.appendChild(o),r.appendChild(m),g("all")};window.ThreadsDownloaderButton.createMediaItem=function(r,t,a){const{findPostInfoFromElement:s}=window.ThreadsDownloaderUtils;let o;try{o=chrome.runtime.getURL("image/download-white.svg")}catch{return console.warn("Threads Downloader: \u64F4\u5145\u529F\u80FD\u4E0A\u4E0B\u6587\u5DF2\u5931\u6548"),null}const e=window.ThreadsFilenameGenerator.generateFilenameFromElement({element:t.postContainer||t.element,type:t.type,index:t.index,useTimestamp:!1,addPrefix:window.ThreadsDownloaderButton._enableFilenamePrefix!==!1}),n=document.createElement("div");n.className=`threads-menu-item threads-menu-item-${t.type}`,n.style.cssText=`
    padding: 10px 16px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
  `;const d=document.createElement("div");d.className="threads-item-thumbnail",d.style.cssText=`
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
  `;const u=document.createElement("div");u.className="threads-preview-overlay",u.style.cssText=`
    display: none;
    position: fixed;
    z-index: 9999999;
    pointer-events: none;
  `;let w;d.addEventListener("mouseenter",i=>{w=setTimeout(()=>{const h=d.getBoundingClientRect();if(u.innerHTML="",t.type==="video"){const y=document.createElement("video");y.src=t.url,y.autoplay=!0,y.loop=!0,y.muted=!0,y.style.cssText=`
          max-width: 400px;
          max-height: 400px;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          background: #000;
        `,u.appendChild(y)}else{const y=document.createElement("img");y.src=t.url,y.style.cssText=`
          max-width: 400px;
          max-height: 400px;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        `,u.appendChild(y)}const f=h.right+10,x=h.bottom;f+400>window.innerWidth?u.style.left=h.left-410+"px":u.style.left=f+"px",u.style.bottom=window.innerHeight-x+"px",u.style.top="auto",u.style.display="block",document.body.appendChild(u)},300)}),d.addEventListener("mouseleave",()=>{clearTimeout(w),u.style.display="none",u.parentElement&&document.body.removeChild(u)});const m=t.type==="video"?t.poster||"":t.thumbnail;if(m){p("[\u9078\u55AE\u7E2E\u5716] \u76F4\u63A5\u4F7F\u7528 URL:",m);const i=document.createElement("img");i.src=m,i.style.cssText=`
      width: 100%;
      height: 100%;
      object-fit: cover;
    `,d.appendChild(i),n.appendChild(d)}else{p("[\u9078\u55AE\u7E2E\u5716] \u6C92\u6709 poster URL\uFF0C\u986F\u793A\u5716\u6A19");const i=document.createElement("span");i.textContent=t.type==="video"?"\u{1F3AC}":"\u{1F5BC}\uFE0F",i.style.fontSize="20px",d.appendChild(i),n.appendChild(d)}const g=document.createElement("span");g.className="threads-item-label",g.style.cssText=`
    flex: 1;
    overflow: hidden;
    font-size: 12px;
    display: flex;
    align-items: center;
  `,g.title=e;const l=e.lastIndexOf(".");if(l>0){const i=e.substring(0,l),h=e.substring(l),f=document.createElement("span");f.textContent=i,f.style.cssText=`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex-shrink: 1;
    `;const x=document.createElement("span");x.textContent=h,x.style.cssText=`
      flex-shrink: 0;
      white-space: nowrap;
    `,g.appendChild(f),g.appendChild(x)}else g.textContent=e,g.style.cssText+=`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;n.appendChild(g);const c=document.createElement("span");return c.className="threads-item-download-icon",c.innerHTML=`<img src="${o}" alt="\u4E0B\u8F09" style="width: 12px; height: 12px;">`,n.appendChild(c),n.addEventListener("mouseenter",()=>{n.style.background="#f5f5f5"}),n.addEventListener("mouseleave",()=>{n.style.background="transparent"}),n.addEventListener("click",i=>{i.stopPropagation(),chrome.runtime.sendMessage({action:"downloadVideo",url:t.url,filename:e},h=>{if(h&&h.success){n.style.background="#e8f5e9",c.textContent="\u2705";const{showPageNotification:f,i18n:x}=window.ThreadsDownloaderUtils;let y="";try{y=chrome.runtime.getURL("image/download-white.svg")}catch{console.warn("Threads Downloader: \u64F4\u5145\u529F\u80FD\u4E0A\u4E0B\u6587\u5DF2\u5931\u6548")}f(`<img src="${y}" alt="download" style="width: 16px; height: 16px;"> ${x("downloadStarted",e)}`),setTimeout(()=>{n.style.background="transparent",c.innerHTML=`<img src="${y}" alt="\u4E0B\u8F09" style="width: 12px; height: 12px;">`},1500)}else{n.style.background="#ffebee",c.textContent="\u274C";const{showPageNotification:f,i18n:x}=window.ThreadsDownloaderUtils;f(x("downloadFailed",e)),setTimeout(()=>{n.style.background="transparent",c.textContent="\u2B07\uFE0F"},2e3)}}),a.style.display="none"}),r.appendChild(n),n};window.ThreadsDownloaderButton.downloadAllAsZip=async function(r,t,a="all"){const{findPostInfoFromElement:s,showPageNotification:o,i18n:e}=window.ThreadsDownloaderUtils;if(typeof JSZip>"u"){o("\u274C "+e("jsZipNotLoaded"));return}const n=t.innerHTML;t.style.pointerEvents="none",t.style.opacity="0.7";let d="";try{d=chrome.runtime.getURL("image/package-white.svg")}catch{console.warn("Threads Downloader: \u64F4\u5145\u529F\u80FD\u4E0A\u4E0B\u6587\u5DF2\u5931\u6548")}try{const u=new JSZip;let w=0;const m=r.length,g=s(r[0].postContainer||r[0].element),l=window.ThreadsFilenameGenerator.generateZipFilename(g,window.ThreadsDownloaderButton._enableFilenamePrefix!==!1,a);t.innerHTML=`\u23F3 ${e("downloadProgress",["0",String(m)])}`;for(let f=0;f<r.length;f++){const x=r[f],y=window.ThreadsFilenameGenerator.generateFilename({type:x.type,index:x.index,postInfo:g,useTimestamp:!1,addPrefix:window.ThreadsDownloaderButton._enableFilenamePrefix!==!1});try{const T=await fetch(x.url);if(!T.ok)throw new Error(`HTTP ${T.status}`);const b=await T.blob();u.file(y,b),w++,t.innerHTML=`\u23F3 ${e("downloadProgress",[String(w),String(m)])}`}catch(T){console.error(`\u4E0B\u8F09\u5931\u6557: ${y}`,T)}}if(w===0)throw new Error(e("allFilesFailed"));t.innerHTML=`\u{1F4E6} ${e("packaging")}`;const c=await u.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}}),i=URL.createObjectURL(c),h=document.createElement("a");h.href=i,h.download=l,h.style.display="none",document.body.appendChild(h),h.click(),document.body.removeChild(h),URL.revokeObjectURL(i),t.innerHTML=`<img src="${d}" alt="package" style="width: 20px; height: 20px;"> ${e("completed",[String(w),String(m)])}`,o(`<img src="${d}" alt="package" style="width: 16px; height: 16px;"> ${e("zipDownloaded",[String(w),l])}`),setTimeout(()=>{t.innerHTML=n,t.style.pointerEvents="auto",t.style.opacity="1"},2e3)}catch(u){console.error("\u6253\u5305\u4E0B\u8F09\u5931\u6557:",u),t.innerHTML=`\u274C ${e("failed")}`,o("\u274C "+e("zipFailed",u.message)),setTimeout(()=>{t.innerHTML=n,t.style.pointerEvents="auto",t.style.opacity="1"},2e3)}};window.ThreadsDownloaderButton.downloadVideoFromPage=function(r,t){const{showPageNotification:a,i18n:s}=window.ThreadsDownloaderUtils,o=document.createElement("a");o.href=r,o.download=t,o.style.display="none",document.body.appendChild(o),o.click(),document.body.removeChild(o),a(s("downloadStarted",t))};})();
