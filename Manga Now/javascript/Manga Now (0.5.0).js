// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: book-open;
// version: 0.5.0
// import { config, Script, ListWidget, Font, WebView, Color, Alert, } from "nios-scriptable";
// -------- USER MANGA LIST ------- //
// Entry example: "https://mangaclash.com/manga/chainsaw-man/"
// Quotes included.
// Entries must be separated by a comma.
const MANGA_LIST = ["https://mangaclash.com/manga/chainsaw-man/"];
// You may modify this value, at the cost of higher losd time and higher posibility of crashing the script.
const INTERNAL_LIMIT = 5;
// -------- MAIN CODE ---------- //
async function mainScript() {
  if (config.runsInWidget) {
    Script.setWidget(await createWidget(null));
  } else {
    const options = ["Small", "Medium", "Large", "Cancel"];
    let resp = await presentAlert("Preview Widget", options, false);
    if (resp == options.length - 1) return;
    let size = options[resp];
    let widget = await createWidget(size.toLowerCase());
    switch (size) {
      case "Small":
        await widget.presentSmall();
        break;
      case "Medium":
        await widget.presentMedium();
        break;
      case "Large":
        await widget.presentLarge();
        break;
    }
  }
  Script.complete();
}
await mainScript();
async function fetchMangaInfo(mangaUrl) {
  let webview = new WebView();
  await webview.loadURL(mangaUrl);
  const getData = `
        function getTitle(){
           return document.querySelector('.post-title > h1').innerText;
         }
        
        function getNewestRelease() {
          const newest = document.querySelector("body > div.wrap > div > div > div > div.c-page-content.style-1 > div > div > div > div.main-col.col-md-8.col-sm-8 > div > div.c-page > div > div.page-content-listing.single-page > div > ul").firstElementChild;
          
          const chapter = newest.querySelector('a').innerText;
          let date;
          try {
            date = newest.querySelector('i').innerText;
          } catch {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            var yyyy = today.getFullYear();
          
            date = today = mm + '/' + dd + '/' + yyyy;
          }  
                    
          return {chapter, date}
        }
        
        function getDetails() {
          const title = getTitle();
          const newest = getNewestRelease();
          
          const format = {
            title: title,
            chapter: newest.chapter,
            date: newest.date
          }
          
          return JSON.stringify(format);
        }

        getDetails()
   `;
  let response = await webview.evaluateJavaScript(getData, false);
  response = JSON.parse(response);
  return {
    title: response.title,
    chapter: response.chapter,
    date: response.date,
  };
}
// -------- UTILS ----------------- //
function addText(container, text, align, size) {
  const txt = container.addText(text);
  switch (align) {
    default:
      txt.leftAlignText();
      break;
    case "center":
      txt.centerAlignText();
      break;
    case "right":
      txt.rightAlignText();
      break;
  }
  txt.font = Font.systemFont(size);
  txt.shadowRadius = 3;
  txt.textColor = Color.white();
  txt.shadowColor = Color.black();
}
async function presentAlert(prompt, items, asSheet) {
  let alert = new Alert();
  alert.message = prompt;
  for (const item of items) alert.addAction(item);
  return asSheet ? await alert.presentSheet() : await alert.presentAlert();
}
function getTimeRefreshStack(stack, font) {
  let newDate = new Date();
  let hours =
    newDate.getHours() < 10 ? "0" + newDate.getHours() : newDate.getHours();
  let minutes =
    newDate.getMinutes() < 10
      ? "0" + newDate.getMinutes()
      : newDate.getMinutes();
  addText(stack, "Last Refresh: " + hours + ":" + minutes, "left", font);
}
// -------- WIDGET ---------------- //
async function createWidget(widgetFamily) {
  widgetFamily = widgetFamily || config.widgetFamily;
  const fontSize = widgetFamily == "large" ? 14 : 10;
  const widget = new ListWidget();
  const REFRESH_RATE = 1; // min
  const refreshDate = Date.now() + 1000 * 60 * REFRESH_RATE;
  widget.refreshAfterDate = new Date(refreshDate);
  const mainStack = widget.addStack();
  mainStack.layoutVertically();
  mainStack.centerAlignContent();
  mainStack.spacing = 10;
  let mangas = [];
  const manga_limit = INTERNAL_LIMIT;
  let limitCounter = 0;
  for (const mangaUrl of MANGA_LIST) {
    if (limitCounter >= manga_limit) break;
    let mangaInfo = await fetchMangaInfo(mangaUrl);
    mangaInfo.url = mangaUrl;
    mangas.push(mangaInfo);
    limitCounter++;
  }
  mangas.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  widget.url = mangas[0].url;
  for (const manga of mangas) {
    addText(
      mainStack,
      `${manga.title} - ${manga.chapter}`,
      "left",
      fontSize + 2
    );
    addText(mainStack, manga.date, "left", fontSize);
    mainStack.addSpacer(2);
  }
  return widget;
}
