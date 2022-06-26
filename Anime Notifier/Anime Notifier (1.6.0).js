// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: hamsa;
// -------------User Config-------------
const animeNotifs = [];

// --------------Main Code--------------
const ANIME_URL = "https://goload.pro";
const REFRESH_RATE = 1; // mins

let simple = simpleCheck(args.widgetParameter);
let notifyCheck = latestAnimeCheck(await getLatestAnime(5));

const WIDGET_BG =
  "https://github.com/SkinnyDevi/scriptable/blob/main/Anime%20Notifier/animeWidget/genericBG.png";

fileCheck(); // DO NOT TOUCH

if (config.runsInWidget) {
  if (notifyCheck != null) {
    await notifyCheck.schedule();
  }

  let widget = await getWidget(simple);
  Script.setWidget(widget);
} else {
  const displays = [
    "View Small Widget",
    "View Medium Widget",
    "View Large Widget",
    "Cancel Display",
  ];
  let chooser = await presentAlert("Preview Widget", displays);

  if (chooser == displays.length - 1) return;

  let size = "";
  let widget;
  if (displays[chooser] == displays[0]) {
    size = "Small";
    widget = await getWidget(simple, "small");
  } else if (displays[chooser] == displays[1]) {
    size = "Medium";
    widget = await getWidget(simple, "medium");
  } else {
    size = "Large";
    widget = await getWidget(simple);
  }

  if (notifyCheck != null) {
    await notifyCheck.schedule();
  }

  await widget[`present${size}`]();
}

Script.complete();

// -----------Large complex Widget---------------
async function createLComplexWidget(data) {
  let widget = new ListWidget();

  var refreshDate = Date.now() + 1000 * 60 * REFRESH_RATE;
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

  function animeEpPadding(epData) {
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

    return parseFloat(padding);
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

  let newDate = new Date();
  let hours = "";
  let minutes = "";

  if (newDate.getHours() < 10) hours = "0" + newDate.getHours();
  else hours = newDate.getHours();

  if (newDate.getMinutes() < 10) minutes = "0" + newDate.getMinutes();
  else minutes = newDate.getMinutes();

  let timeStamp = hours + ":" + minutes;
  timeStamp = "Last Refresh: " + timeStamp;
  addText(refreshTimeStack, timeStamp, refreshTimeFont);

  refreshTimeStack.addSpacer(16);
  widget.addSpacer(12);

  return widget;
}

// -----------Large Simple Widget-------------
async function createLSimpleWidget(data) {
  let widget = new ListWidget();

  const latestFontSize = config.widgetFamily == "large" ? 13 : 12;
  const animeFontSize = config.widgetFamily == "large" ? 12 : 10;
  const timeStampSize = config.widgetFamily == "large" ? 8 : 5;

  let spacerFont = Font.boldSystemFont(animeFontSize);
  let latestFont = Font.blackMonospacedSystemFont(latestFontSize);
  let animeFont = Font.systemFont(animeFontSize);
  let refreshTimeFont = Font.systemFont(timeStampSize);

  const latestAnimeSize = new Size(82, 82);

  var refreshDate = Date.now() + 1000 * 60 * REFRESH_RATE;
  widget.refreshAfterDate = new Date(refreshDate);

  let req = new Request(data[0].image);
  let latestImage = await req["loadImage"](data[0].image);

  const widgetBG = Image.fromFile(
    `${FileManager.iCloud().documentsDirectory()}/animeWidget/widgetBG.JPG`
  );

  widget.backgroundImage = widgetBG;
  widget.url = ANIME_URL;

  widget.addSpacer(22);
  const latestStack = widget.addStack();
  latestStack.layoutVertically();
  let latestInfoStack = latestStack.addStack();
  latestInfoStack.layoutHorizontally();
  let latestTitleStack = latestInfoStack.addStack();
  let latestTitle = addText(
    latestTitleStack,
    "1. " + data[0].title,
    latestFont
  );
  let latestPadFormatter = 35;
  if (data[0].title.length < 10) {
    latestPadFormatter = 76;
  } else if (data[0].title.length < 17) {
    latestPadFormatter = 52;
  }
  latestTitleStack.setPadding(35, latestPadFormatter, 0, 0);
  let anime1ImgStack = latestInfoStack.addStack();
  anime1ImgStack.layoutVertically();
  let anime1Thumb = addImage(anime1ImgStack, latestImage, latestAnimeSize, 24);
  let anime1ImgText = anime1ImgStack.addStack();
  let anime1Ep = anime1ImgText.addText(data[0].episode);
  anime1Ep.font = animeFont;
  let latestEpPadding = 30;
  if (data[0].episode.length == 5) {
    latestEpPadding = 25;
  } else if (data[0].episode.length == 6) {
    latestEpPadding = 19;
  } else if (data[0].episode.length == 7) {
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

  let newDate = new Date();
  let hours = "";
  let minutes = "";

  if (newDate.getHours() < 10) {
    hours = "0" + newDate.getHours();
  } else {
    hours = newDate.getHours();
  }

  if (newDate.getMinutes() < 10) {
    minutes = "0" + newDate.getMinutes();
  } else {
    minutes = newDate.getMinutes();
  }

  let timeStamp = hours + ":" + minutes;
  timeStamp = "Last Refresh: " + timeStamp;
  let refreshTime = addText(refreshTimeStack, timeStamp, refreshTimeFont);

  refreshTimeStack.addSpacer();

  widget.addSpacer(16);

  return widget;
}
// ---------Get Latest Anime ---------------
async function getLatestAnime(num) {
  let animeHTML = await new Request(ANIME_URL).loadString();
  const start = '<ul class="listing items">';
  animeHTML = animeHTML
    .slice(
      animeHTML.indexOf(start) + start.length,
      animeHTML.indexOf(`<!-- end for -->`)
    )
    .trim();

  let animesRAW = [];
  for (let i = 0; i < parseInt(num); i++) {
    let animeRaw = animeHTML
      .slice(
        animeHTML.indexOf('<li class="video-block ">'),
        animeHTML.indexOf("</li>") + 5
      )
      .trim();
    animesRAW.push(animeRaw);
    animeHTML = animeHTML.trim().substring(animeRaw.length);
  }

  let animes = [];
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

    let json = {
      title: name,
      episode: episode,
      image: imgUrl,
      link: ANIME_URL + url,
    };
    console.log(json);
    animes.push(json);
  }

  return animes;
}

// ---------------Other Tools-------------------
async function getWidget(s, dim) {
  let widgetSize = config.widgetFamily || dim;
  let widget;
  let latestAnimes;
  if (s) {
    if (widgetSize == "small") {
      widget = console.log("s small widget");
    } else if (widgetSize == "medium") {
      widget = console.log("s medium widget");
    } else {
      latestAnimes = await getLatestAnime(7);
      widget = await createLSimpleWidget(latestAnimes);
    }
  } else {
    if (widgetSize == "small") {
      widget = console.log("small widget");
    } else if (widgetSize == "medium") {
      widget = console.log("medium widget");
    } else {
      latestAnimes = await getLatestAnime(5);
      widget = await createLComplexWidget(latestAnimes);
    }
  }

  return widget;
}

function addImage(stack, image, size, roundness) {
  let img = stack.addImage(image);
  img.imageSize = size;
  img.cornerRadius = roundness;

  return img;
}

async function presentAlert(prompt, items) {
  let alert = new Alert();
  alert.message = prompt;

  for (const item of items) {
    alert.addAction(item);
  }
  let resp = await alert.presentSheet();
  return resp;
}

function addText(stack, text, font) {
  let stackText = stack.addText(text);
  stackText.font = font;

  return stackText;
}

function createNotification(data) {
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

function userAnimesLower(userAnimes) {
  let newUserAnimes = [];
  for (let anime of userAnimes) {
    anime = anime.toLowerCase();
    newUserAnimes.push(anime);
  }

  return newUserAnimes;
}

function latestAnimeCheck(newAnimes) {
  const currentAnimeJSON = `${FileManager.iCloud().documentsDirectory()}/animeWidget/currentAnime.json`;

  let currentAnime = newAnimes[0];

  let animeFromJSON = JSON.parse(
    FileManager.iCloud().readString(currentAnimeJSON)
  );

  let notif = null;
  if (animeFromJSON.title != currentAnime.title) {
    let userAnimesLow = userAnimesLower(animeNotifs);
    let titleLow = newAnimes[0].title.toLowerCase();

    if (userAnimesLow.indexOf(titleLow) > -1) {
      notif = createNotification(newAnimes);
    }

    FileManager.iCloud().writeString(
      currentAnimeJSON,
      JSON.stringify(currentAnime)
    );
  }

  return notif;
}

function simpleCheck(parameters) {
  let x = false;
  if (parameters != null) {
    parameters = parameters.toLowerCase();
    if (parameters == "true") {
      x = true;
    }
  }

  return x;
}

function fileCheck() {
  let fm = FileManager.iCloud();
  let dirPath = fm.documentsDirectory();
  let filePath = fm.joinPath(dirPath, "/animeWidget/currentAnime.json");

  let exists = fm.fileExists(filePath);

  if (!exists) {
    let json = {
      title: "anime",
      episode: "episode",
      image: "https://static",
      link: "9anime",
    };

    json = JSON.stringify(json);
    fm.writeString(filePath, json);
  }
}
