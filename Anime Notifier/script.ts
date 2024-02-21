// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: hamsa;
// version: 1.6.1
// author: SkinnyDevi (GitHub)

import {
  args,
  config,
  Script,
  ListWidget,
  Request,
  Font,
  Size,
  WidgetStack,
  ImageType,
  Alert,
  Notification,
  FileManager,
} from "nios-scriptable";

// -------------User Config-------------
const NOTIFY_ME: string[] = [];
const REFRESH_RATE = 1; // mins

// --------------Main Code--------------
const ANIME_URL = "https://goload.pro"; // main source, do not touch

const WIDGET_BG =
  "https://raw.githubusercontent.com/SkinnyDevi/scriptable/main/Anime%20Notifier/backgrounds/genericBG-u.png";

async function mainScript() {
  const simple = simpleCheck(args.widgetParameter);
  let notifyCheck = latestAnimeCheck(await getLatestAnime(5));

  notifyFileSync(); // important for notifications, do not touch

  if (config.runsInWidget) {
    if (notifyCheck != null) await notifyCheck.schedule();

    let widget = await getWidget(simple, null);
    Script.setWidget(widget);
  } else {
    const displays = [
      "View Small Widget",
      "View Medium Widget",
      "View Large Widget",
      "Cancel Display",
    ];

    let chooser = await presentAlert("Preview Widget", displays);
    if (chooser === displays.length - 1) return;

    let size = "";
    switch (displays[chooser]) {
      case displays[0]:
        size = "Small";
        break;
      case displays[1]:
        size = "Medium";
        break;
      default:
        size = "Large";
        break;
    }
    const widget = await getWidget(simple, size);

    if (notifyCheck != null) await notifyCheck.schedule();

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

// ---------Get Latest Anime ---------------
interface AnimeInfo {
  title: string;
  episode: string;
  image: string;
  link: string;
}

async function getLatestAnime(num: number) {
  let animeHTML = await new Request(ANIME_URL).loadString();
  const start = '<ul class="listing items">';
  animeHTML = animeHTML
    .slice(
      animeHTML.indexOf(start) + start.length,
      animeHTML.indexOf(`<!-- end for -->`)
    )
    .trim();

  let animesRAW = [];
  for (let i = 0; i < num; i++) {
    let animeRaw = animeHTML
      .slice(
        animeHTML.indexOf('<li class="video-block ">'),
        animeHTML.indexOf("</li>") + 5
      )
      .trim();
    animesRAW.push(animeRaw);
    animeHTML = animeHTML.trim().substring(animeRaw.length);
  }

  let animes: AnimeInfo[] = [];
  for (let animeRAW of animesRAW) {
    let nameStart =
      animeRAW.indexOf('<div class="name">') + '<div class="name">'.length;
    let name = animeRAW.slice(nameStart);
    name = name.slice(0, name.indexOf("</div>"));

    let episode = name.slice(name.indexOf("Episode"));
    episode = episode.replace("Episode", "Ep").trim();

    name = name.slice(0, name.indexOf("Episode")).trim();

    let imgUrlStart = animeRAW.indexOf("src") + 5;
    let imgUrlEnd = animeRAW.indexOf("alt") - 2;
    let imgUrl = animeRAW.slice(imgUrlStart, imgUrlEnd);

    let urlStart = animeRAW.indexOf("href=") + 6;
    let url = animeRAW.slice(urlStart);
    url = url.slice(0, url.indexOf('">'));

    animes.push({
      title: name,
      episode: episode,
      image: imgUrl,
      link: ANIME_URL + url,
    });
  }

  return animes;
}

// -----------Large complex Widget---------------
async function createLComplexWidget(data: AnimeInfo[]) {
  let widget = new ListWidget();

  const refreshDate = Date.now() + 1000 * 60 * REFRESH_RATE;
  widget.refreshAfterDate = new Date(refreshDate);

  let animeThumbnails = [];
  for (let img of data)
    animeThumbnails.push(await new Request(img.image).loadImage());

  const latestFontSize = config.widgetFamily == "large" ? 13 : 11;
  const animeFontSize = config.widgetFamily == "large" ? 12 : 10;
  const timeStampSize = config.widgetFamily == "large" ? 8 : 5;

  let latestFont = Font.blackMonospacedSystemFont(latestFontSize);
  let animeFont = Font.systemFont(animeFontSize);
  let refreshTimeFont = Font.systemFont(timeStampSize);

  const latestAnimeSize = new Size(82, 82);
  const animeThumbSize = new Size(63, 63);

  const widgetBG = await new Request(WIDGET_BG).loadImage();

  widget.backgroundImage = widgetBG;
  widget.url = ANIME_URL;

  widget.addSpacer(24);
  const latestStack = widget.addStack();
  latestStack.layoutVertically();
  let latestInfoStack = latestStack.addStack();
  latestInfoStack.layoutHorizontally();
  let latestTitleStack = latestInfoStack.addStack();
  addText(latestTitleStack, "1. " + data[0].title, latestFont);
  let latestPadFormatter = 35;
  if (data[0].title.length < 10) latestPadFormatter = 76;
  else if (data[0].title.length < 17) latestPadFormatter = 52;

  latestTitleStack.setPadding(35, latestPadFormatter, 0, 0);
  let anime1ImgStack = latestInfoStack.addStack();
  anime1ImgStack.layoutVertically();
  addImage(anime1ImgStack, animeThumbnails[0], latestAnimeSize, 24);
  let anime1ImgText = anime1ImgStack.addStack();
  let anime1Ep = anime1ImgText.addText(data[0].episode);
  anime1Ep.font = animeFont;
  let latestEpPadding = 30;
  switch (data[0].episode.length) {
    case 5:
      latestEpPadding = 25;
      break;
    case 6:
      latestEpPadding = 19;
      break;
    case 7:
      latestEpPadding = 21;
  }
  anime1ImgText.setPadding(0, latestEpPadding, 5, 0);

  const animeStack = widget.addStack();
  animeStack.setPadding(0, 15, 0, 0);
  animeStack.layoutVertically();
  const animeStackHolder1 = animeStack.addStack();
  const animeStackHolder2 = animeStack.addStack();
  animeStackHolder1.layoutVertically();
  animeStackHolder2.layoutVertically();
  const animeStack1 = animeStackHolder1.addStack();
  const animeStack2 = animeStackHolder2.addStack();
  animeStack1.layoutHorizontally();
  animeStack2.layoutHorizontally();

  // sourcery skip: avoid-function-declarations-in-blocks
  function animeEpPadding(epData: string) {
    let padding = 19;
    switch (epData.length) {
      case 5:
        padding = 15;
        break;
      case 6:
        padding = 13;
        break;
      case 7:
        padding = 10;
    }

    return padding;
  }

  let anime2Stack1 = animeStack1.addStack();
  addText(anime2Stack1, "2. " + data[1].title, animeFont);
  anime2Stack1.setPadding(20, 0, 0, 0);
  let anime2ImgStack = anime2Stack1.addStack();
  anime2ImgStack.layoutVertically();
  addImage(anime2ImgStack, animeThumbnails[1], animeThumbSize, 18);
  let anime2ImgText = anime2ImgStack.addStack();
  addText(anime2ImgText, data[1].episode, animeFont);
  anime2ImgText.setPadding(0, animeEpPadding(data[1].episode), 5, 0);

  animeStack1.addSpacer(7);

  let anime3Stack1 = animeStack1.addStack();
  addText(anime3Stack1, "3. " + data[2].title, animeFont);
  anime3Stack1.setPadding(20, 0, 0, 0);
  let anime3ImgStack = anime3Stack1.addStack();
  anime3ImgStack.layoutVertically();
  addImage(anime3ImgStack, animeThumbnails[2], animeThumbSize, 18);
  let anime3ImgText = anime3ImgStack.addStack();
  addText(anime3ImgText, data[2].episode, animeFont);
  anime3ImgText.setPadding(0, animeEpPadding(data[2].episode), 5, 0);

  let anime4Stack2 = animeStack2.addStack();
  addText(anime4Stack2, "4. " + data[3].title, animeFont);
  anime4Stack2.setPadding(20, 0, 0, 0);
  let anime4ImgStack = anime4Stack2.addStack();
  anime4ImgStack.layoutVertically();
  addImage(anime4ImgStack, animeThumbnails[3], animeThumbSize, 18);
  let anime4ImgText = anime4ImgStack.addStack();
  addText(anime4ImgText, data[3].episode, animeFont);
  anime4ImgText.setPadding(0, animeEpPadding(data[3].episode), 0, 0);

  animeStack2.addSpacer(5);

  let anime5Stack2 = animeStack2.addStack();
  addText(anime5Stack2, "5. " + data[4].title, animeFont);
  anime5Stack2.setPadding(20, 0, 0, 0);
  let anime5ImgStack = anime5Stack2.addStack();
  anime5ImgStack.layoutVertically();
  addImage(anime5ImgStack, animeThumbnails[4], animeThumbSize, 18);
  let anime5ImgText = anime5ImgStack.addStack();
  addText(anime5ImgText, data[4].episode, animeFont);
  anime5ImgText.setPadding(0, animeEpPadding(data[4].episode), 0, 0);

  animeStack.addSpacer(19);

  let refreshTimeStack = widget.addStack();
  refreshTimeStack.layoutHorizontally();

  getTimeRefreshStack(refreshTimeStack, refreshTimeFont);

  refreshTimeStack.addSpacer(16);
  widget.addSpacer(12);

  return widget;
}

// -----------Large Simple Widget-------------
async function createLSimpleWidget(data: AnimeInfo[]) {
  let widget = new ListWidget();

  const latestFontSize = config.widgetFamily == "large" ? 13 : 12;
  const animeFontSize = config.widgetFamily == "large" ? 12 : 10;
  const timeStampSize = config.widgetFamily == "large" ? 8 : 5;

  let spacerFont = Font.boldSystemFont(animeFontSize);
  let latestFont = Font.blackMonospacedSystemFont(latestFontSize);
  let animeFont = Font.systemFont(animeFontSize);
  let refreshTimeFont = Font.systemFont(timeStampSize);

  const latestAnimeSize = new Size(82, 82);

  const refreshDate = Date.now() + 1000 * 60 * REFRESH_RATE;
  widget.refreshAfterDate = new Date(refreshDate);

  let latestImage = await new Request(data[0].image).loadImage();

  const widgetBG = await new Request(WIDGET_BG).loadImage();

  widget.backgroundImage = widgetBG;
  widget.url = ANIME_URL;

  widget.addSpacer(22);
  const latestStack = widget.addStack();
  latestStack.layoutVertically();
  let latestInfoStack = latestStack.addStack();
  latestInfoStack.layoutHorizontally();
  let latestTitleStack = latestInfoStack.addStack();
  addText(latestTitleStack, "1. " + data[0].title, latestFont);
  let latestPadFormatter = 35;
  if (data[0].title.length < 10) latestPadFormatter = 76;
  else if (data[0].title.length < 17) latestPadFormatter = 52;
  latestTitleStack.setPadding(35, latestPadFormatter, 0, 0);
  let anime1ImgStack = latestInfoStack.addStack();
  anime1ImgStack.layoutVertically();
  addImage(anime1ImgStack, latestImage, latestAnimeSize, 24);
  let anime1ImgText = anime1ImgStack.addStack();
  let anime1Ep = anime1ImgText.addText(data[0].episode);
  anime1Ep.font = animeFont;
  let latestEpPadding = 30;
  switch (data[0].episode.length) {
    case 5:
      latestEpPadding = 25;
      break;
    case 6:
      latestEpPadding = 19;
      break;
    case 7:
      latestEpPadding = 21;
  }
  anime1ImgText.setPadding(0, latestEpPadding, 5, 0);

  let animeList = widget.addStack();
  animeList.layoutVertically();
  animeList.addSpacer(23);

  const spacer = "------------------------------------------------------";
  addText(animeList, spacer, spacerFont);
  for (let i = 1; i < data.length; i++) {
    let animeFormat = i + 1 + ". | " + data[i].episode + " | " + data[i].title;
    addText(animeList, animeFormat, animeFont);
    addText(animeList, spacer, spacerFont);
  }

  animeList.addSpacer(15);

  let refreshTimeStack = widget.addStack();
  refreshTimeStack.layoutHorizontally();

  getTimeRefreshStack(refreshTimeStack, refreshTimeFont);

  refreshTimeStack.addSpacer();
  widget.addSpacer(16);

  return widget;
}

// ---------------Other Tools-------------------
async function getWidget(simple: boolean, dim: string | null) {
  const widgetSize = config.widgetFamily || dim;
  switch (widgetSize) {
    default:
      let latestAnimes = await getLatestAnime(simple ? 7 : 5);
      return simple
        ? await createLSimpleWidget(latestAnimes)
        : await createLComplexWidget(latestAnimes);
  }
}

function addImage(
  stack: WidgetStack,
  image: ImageType,
  size: Size,
  roundness: number
) {
  let img = stack.addImage(image);
  img.imageSize = size;
  img.cornerRadius = roundness;

  return img;
}

async function presentAlert(prompt: string, items: string[]) {
  let alert = new Alert();
  alert.message = prompt;

  for (const item of items) alert.addAction(item);
  return await alert.presentSheet();
}

function addText(stack: WidgetStack, text: string, font: Font) {
  let stackText = stack.addText(text);
  stackText.font = font;

  return stackText;
}

function createNotification(data: AnimeInfo[]) {
  let notif = new Notification();
  let notifT = data[0].title;
  let notifEp = data[0].episode;
  notif.title = notifT + " Released";
  notif.body = "New " + notifT + " episode: " + notifEp;
  notif.openURL = data[0].link;
  notif.identifier = notifT;
  notif.threadIdentifier = "anime-notify";

  return notif;
}

function userAnimesLower(userAnimes: string[]) {
  let newUserAnimes = [];
  for (let anime of userAnimes) newUserAnimes.push(anime.toLowerCase());
  return newUserAnimes;
}

function latestAnimeCheck(newAnimes: AnimeInfo[]) {
  const currentAnimeJSON = `${FileManager.iCloud().documentsDirectory()}/animeWidget/currentAnime.json`;
  let currentAnime = newAnimes[0];

  const loadedJSON = FileManager.iCloud().readString(currentAnimeJSON);

  if (!loadedJSON) throw new Error("No Current Anime JSON");

  let animeFromJSON: AnimeInfo = JSON.parse(loadedJSON);

  let notif = null;
  if (animeFromJSON.title !== currentAnime.title) {
    let userAnimesLow = userAnimesLower(NOTIFY_ME);

    if (userAnimesLow.indexOf(currentAnime.title.toLowerCase()) > -1)
      notif = createNotification(newAnimes);

    FileManager.iCloud().writeString(
      currentAnimeJSON,
      JSON.stringify(currentAnime)
    );
  }

  return notif;
}

function simpleCheck(parameters: any) {
  if (parameters === null) return false;
  else return parameters.toLowerCase() === "true";
}

function notifyFileSync() {
  let fm = FileManager.iCloud();
  let dirPath = fm.documentsDirectory();
  let filePath = fm.joinPath(dirPath, "/animeWidget/currentAnime.json");

  if (!fm.fileExists(filePath)) {
    let json = {
      title: "anime",
      episode: "episode",
      image: "https://static",
      link: "9anime",
    };

    fm.writeString(filePath, JSON.stringify(json));
  }
}

function getTimeRefreshStack(stack: WidgetStack, font: Font) {
  const newDate = new Date();
  const hours =
    newDate.getHours() < 10 ? "0" + newDate.getHours() : newDate.getHours();
  const minutes =
    newDate.getMinutes() < 10
      ? "0" + newDate.getMinutes()
      : newDate.getMinutes();

  addText(stack, "Last Refresh: " + hours + ":" + minutes, font);
}
