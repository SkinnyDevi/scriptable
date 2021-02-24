// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: hamsa;
// -------------User Config-------------
// (to come in future)
// --------------Main Code--------------
const animeUrl = "https://www12.9anime.to/home"
let latestAnimes = await getLatestAnime()

if (config.runsInWidget) {
  let widget = await createLComplexWidget(latestAnimes)
  Script.setWidget(widget)
} else {
  const displays = ['View Small Widget', 'View Medium Widget', 'View Large Widget', 'Cancel Display']
  let chooser = await presentAlert('Preview Widget', displays)
  if (chooser == displays.length-1) return
  let size = ""
  if (displays[chooser] == displays[0]) {
    size = "Small"
  } else if (displays[chooser] == displays[1]) {
    size = "Medium"
  } else {
    size = "Large"
  }
  let widget = await createLComplexWidget(latestAnimes)
  
  await widget[`present${size}`]()
}
  
Script.complete() 

// -----------Main Widget---------------
async function createLComplexWidget(data) {
  let widget = new ListWidget()
  
  const REFRESH_RATE = 1 // min

  var refreshDate = Date.now() + 1000*60*REFRESH_RATE
  widget.refreshAfterDate = new Date(refreshDate)
  
  let animeThumbnails = []
  for (let img of data) {
    let req = new Request(img.image)
    let image = await req["loadImage"](img.image)
    animeThumbnails.push(image)
  } 
  
  const latestFontSize = config.widgetFamily=='large' ? 13 : 11
  const animeFontSize = config.widgetFamily=='large' ? 12 : 10
  const timeStampSize = config.widgetFamily=='large' ? 8 : 5
  
  let latestFont = Font.systemFont(latestFontSize)
  let animeFont = Font.systemFont(animeFontSize)
  let refreshTimeFont = Font.systemFont(timeStampSize)
  
  const latestAnimeSize = new Size(82, 82)
  const animeThumbSize = new Size(63, 63)
  
  const widgetBG = Image.fromFile(`${FileManager.iCloud().documentsDirectory()}/animeWidget/widgetBG.JPG`);

  widget.backgroundImage = widgetBG
  widget.url = animeUrl
  
  widget.addSpacer(20)
  const latestStack = widget.addStack()
  latestStack.layoutVertically()
  let latestInfoStack = latestStack.addStack()
  latestInfoStack.layoutHorizontally()
  let latestTitleStack = latestInfoStack.addStack()
  let latestTitle = addText(latestTitleStack, "1. "+data[0].title, latestFont)
  let latestPadFormatter = 35
  if (data[0].title.length < 10) {
    latestPadFormatter = 76
  } else if (data[0].title.length < 17) {
    latestPadFormatter = 52
  }
  latestTitleStack.setPadding(35, latestPadFormatter, 0, 0)
  let anime1ImgStack = latestInfoStack.addStack()
  anime1ImgStack.layoutVertically()
  let anime1Thumb = addImage(anime1ImgStack, animeThumbnails[0], latestAnimeSize, 24)
  let anime1ImgText = anime1ImgStack.addStack()
  let anime1Ep = anime1ImgText.addText(data[0].episode)
  anime1Ep.font = animeFont
  let latestEpPadding = 30
  if (data[0].episode.length == 5) {
    latestEpPadding = 23
  } else if (data[0].episode.length == 6) {
    latestEpPadding = 19
  } else if (data[0].episode.length == 7) {
    latestEpPadding = 15
  }
  anime1ImgText.setPadding(0, latestEpPadding, 5, 0)
  
  const animeStack = widget.addStack()
  animeStack.setPadding(0, 15, 0, 0)
  animeStack.layoutVertically()
  const animeStackHolder1 = animeStack.addStack()
  const animeStackHolder2 = animeStack.addStack()
  animeStackHolder1.layoutVertically()
  animeStackHolder2.layoutVertically()
  const animeStack1 = animeStackHolder1.addStack()
  const animeStack2 = animeStackHolder2.addStack()
  animeStack1.layoutHorizontally()
  animeStack2.layoutHorizontally()
  
  function animeEpPadding(epData) {
    let padding = 20.5
    if (epData.length == 5) {
      padding = 17
    } else if (epData.length == 6) {
      padding = 14
    } else if (epData.length == 7) {
      padding = 10
    }
    
    return parseFloat(padding)
  }
  
  let anime2Stack1 = animeStack1.addStack()
  let anime2 = addText(anime2Stack1, "2. "+data[1].title, animeFont)
  anime2Stack1.setPadding(20, 0, 0, 0)
  let anime2ImgStack = anime2Stack1.addStack()
  anime2ImgStack.layoutVertically()
  let anime2Thumb = addImage(anime2ImgStack, animeThumbnails[1], animeThumbSize, 18)
  let anime2ImgText = anime2ImgStack.addStack()
  let anime2Ep = addText(anime2ImgText, data[1].episode, animeFont)
  anime2ImgText.setPadding(0, animeEpPadding(data[1].episode), 5, 0)
  
  animeStack1.addSpacer(5)
  
  let anime3Stack1 = animeStack1.addStack()
  let anime3 = addText(anime3Stack1, "3. "+data[2].title, animeFont)
  anime3Stack1.setPadding(20, 0, 0, 0)
  let anime3ImgStack = anime3Stack1.addStack()
  anime3ImgStack.layoutVertically()
  let anime3Thumb = addImage(anime3ImgStack, animeThumbnails[2], animeThumbSize, 18)
  let anime3ImgText = anime3ImgStack.addStack()
  let anime3Ep = addText(anime3ImgText, data[2].episode, animeFont)
  anime3ImgText.setPadding(0, animeEpPadding(data[2].episode), 5, 0)
  
  let anime4Stack2 = animeStack2.addStack()
  let anime4 = addText(anime4Stack2, "4. "+data[3].title, animeFont)
  anime4Stack2.setPadding(20, 0, 0, 0)
  let anime4ImgStack = anime4Stack2.addStack()
  anime4ImgStack.layoutVertically()
  let anime4Thumb = addImage(anime4ImgStack, animeThumbnails[3], animeThumbSize, 18)
  let anime4ImgText = anime4ImgStack.addStack()
  let anime4Ep = addText(anime4ImgText, data[3].episode, animeFont)
  anime4ImgText.setPadding(0, animeEpPadding(data[3].episode), 0, 0)

  animeStack2.addSpacer(5)
  
  let anime5Stack2 = animeStack2.addStack()
  let anime5 = addText(anime5Stack2, "5. "+data[4].title, animeFont)
  anime5Stack2.setPadding(20, 0, 0, 0)
  let anime5ImgStack = anime5Stack2.addStack()
  anime5ImgStack.layoutVertically()
  let anime5Thumb = addImage(anime5ImgStack, animeThumbnails[4], animeThumbSize, 18)
  let anime5ImgText = anime5ImgStack.addStack()
  let anime5Ep = addText(anime5ImgText, data[4].episode, animeFont)
  anime5ImgText.setPadding(0, animeEpPadding(data[4].episode), 0, 0)
  
  animeStack.addSpacer(10)
  
  let refreshTimeStack = widget.addStack()
  refreshTimeStack.layoutVertically()
  
  let newDate = new Date()
  let hours = ""
  let minutes = ""
  
  if (newDate.getHours() < 10) {
    hours = "0" + newDate.getHours()
  } else {
    hours = newDate.getHours()
  }
  
  if (newDate.getMinutes() < 10) {
    minutes = "0" + newDate.getMinutes()
  } else {
    minutes = newDate.getMinutes()
  }
  
  let timeStamp = hours + ":" + minutes
  timeStamp = "Last Refresh: " + timeStamp
  let refreshTime = addText(refreshTimeStack, timeStamp, refreshTimeFont)
  
  refreshTimeStack.addSpacer(12)
  
  return widget
}
// --------------Error Widget-----------------
// ---------Get 5 Latest Anime ---------------
async function getLatestAnime() {
  const req = new Request(animeUrl)
  var animeHTML = await req.loadString()
  animeHTML = animeHTML.slice(animeHTML.search("anime-list")+13, animeHTML.lastIndexOf("</a> </li> </ul>    </div> </section>")+10)

  let animesRaw = []
  for (let i = 0; i < 5; i++) {
    let indexStart = animeHTML.indexOf("<li>")
    let indexEnd = animeHTML.indexOf("</li>")
    let animeRaw = animeHTML.slice(indexStart, indexEnd+5)
    animesRaw.push(animeRaw)
    animeHTML = animeHTML.substring(animeRaw.length)
  }
  
  let animes = []
  for (let animeRaw of animesRaw) {
    let imgUrlStart = animeRaw.indexOf("src=")
    let imgUrlEnd = animeRaw.indexOf('"><div class="tag ep"')
    let imgUrl = "http:" + animeRaw.slice(imgUrlStart+5, imgUrlEnd)
    
    let nameStart = animeRaw.indexOf("jtitle=")
    let nameEnd = animeRaw.lastIndexOf('">')
    let name = animeRaw.slice(nameStart+8, nameEnd)
    
    let epStart = animeRaw.indexOf('ep">')
    let epEnd = animeRaw.indexOf('</div> <div class="taglist">')
    let episode = animeRaw.slice(epStart+4, epEnd)
    
    if (episode.includes('/')) {
      episode = episode.substring(0, episode.indexOf("/"))
    }

    let urlStart = animeRaw.lastIndexOf("href=")
    let urlEnd = animeRaw.indexOf('class="name"')
    let url = animeRaw.slice(urlStart+6, urlEnd-2)
    
    
    let json = {
      title: name,
      episode: episode,
      image: imgUrl,
      link: url
    }
    
    animes.push(json)
  }
  
  return animes
}

// ---------------Other Tools-------------------
function addImage(stack, image, size, roundness) {
  let img = stack.addImage(image)
  img.imageSize = size
  img.cornerRadius = roundness
  
  return img
}

async function presentAlert(prompt,items) {

  let alert = new Alert()
  alert.message = prompt
  
  for (const item of items) {
    alert.addAction(item)
  }
  let resp = await alert.presentSheet()
  return resp
}

function addText(stack, text, font) {
  let stackText = stack.addText(text)
  stackText.font = font
  
  return stackText
}