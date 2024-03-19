// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: chart-bar;
// version: 1.0.1
// author: SkinnyDevi (GitHub)
// import { config, Script, ListWidget, Font, Color, Alert, LinearGradient, Request, args, } from "nios-scriptable";
// -------- USER CONFIG ------- //
const PRODUCT_URL = args.widgetParameter;
const WIDGET_BG = `
https://media.istockphoto.com/id/1169630303/photo/blue-textured-background.webp?b=1&s=170667a&w=0&k=20&c=tI2xFhXqXFqMM0IvxSYY3F7LIwv450h2ch3yD-lZ9HU=
`;
const USE_ENG = true;
const SHOW_TEXT = true;
const USE_CUSTOM_IMAGE = false;
// -------- MAIN CODE ---------- //
async function mainScript() {
  const displayer = await productFetcher();
  if (config.runsInWidget) {
    let widget = displayer.has_error
      ? await createErrorWidget(displayer)
      : await createWidget(displayer, null);
    Script.setWidget(widget);
  } else {
    const options = ["Small", "Medium", "Large", "Cancel"];
    let resp = await presentAlert("Preview Widget", options, false);
    if (resp == options.length - 1) return;
    let size = options[resp];
    let widget = displayer.has_error
      ? await createErrorWidget(displayer)
      : await createWidget(displayer, size.toLowerCase());
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
// -------- PRODUCT FETCHER --------- //
async function productFetcher() {
  if (PRODUCT_URL === null) {
    return {
      has_error: true,
      err_msg: USE_ENG
        ? "This text was displayed because no URL was specified."
        : "No se ha proporcionado un enlace para buscar el producto.",
    };
  }
  const htmlString = await new Request(PRODUCT_URL.trim()).loadString();
  const moneySymbol = sliceFromString(
    htmlString,
    'class="a-price-symbol"',
    1,
    1
  );
  const mainPrice = sliceFromString(
    htmlString,
    'class="a-price-whole"',
    1,
    9,
    true
  );
  const decimalPrice = sliceFromString(
    htmlString,
    'class="a-price-fraction"',
    1,
    2
  );
  const productTitle = sliceFromString(
    htmlString,
    'id="productTitle"',
    47,
    999999,
    true
  );
  const imgTag = sliceFromString(htmlString, 'id="imgTagWrapperId"', 20, 500);
  const imgUrl = sliceFromString(imgTag, 'src="', 0, 100, true, '"');
  const discountPercent = parseInt(
    sliceFromString(htmlString, "savingsPercentage", 3, 3, true)
  );
  const prodName = productTitle.substr(0, 21).trim();
  const productPrice = mainPrice + "." + decimalPrice + moneySymbol;
  const discountP = discountPercent > 0 ? discountPercent : 0;
  const imageUrl = (USE_CUSTOM_IMAGE ? WIDGET_BG : imgUrl) || WIDGET_BG;
  const now = new Date();
  const nowRefresh = now.toLocaleTimeString();
  const priceLabel = USE_ENG ? "Price" : "Precio";
  const discountLabel = USE_ENG ? "Discount" : "Descuento";
  const checkLabel = USE_ENG ? "Last Check" : "Ultimo Checkeo";
  return {
    has_error: false,
    imgUrl: imageUrl,
    url: PRODUCT_URL.trim(),
    text: `${prodName} - ${priceLabel}: ${productPrice}
${discountLabel} ${discountP}%
${checkLabel}: ${nowRefresh}`,
  };
}
// -------- UTILS -------- //
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
function newLinearGradient(hexcolors, locations) {
  let gradient = new LinearGradient();
  gradient.locations = locations;
  gradient.colors = hexcolors.map((color) => new Color(color));
  return gradient;
}
async function presentAlert(prompt, items, asSheet) {
  let alert = new Alert();
  alert.message = prompt;
  for (const item of items) {
    alert.addAction(item);
  }
  return asSheet ? await alert.presentSheet() : await alert.presentAlert();
}
function sliceFromString(
  baseStr,
  str,
  startIndexOffset,
  strLength,
  removeEndOfTextTag = false,
  customSeparatorString = "<"
) {
  const starter = baseStr.indexOf(str);
  const startIndex = starter + str.length + startIndexOffset;
  const sliced = baseStr.slice(startIndex, startIndex + strLength);
  return removeEndOfTextTag
    ? sliced.split(customSeparatorString)[0].trim()
    : sliced.trim();
}
// -------- WIDGET -------- //
async function createWidget(data, widgetFamily) {
  widgetFamily = widgetFamily || config.widgetFamily;
  const padd = widgetFamily == "large" ? 12 : 10;
  const fontSize = 18;
  const widget = new ListWidget();
  const req = new Request(data.imgUrl.trim());
  const img = await req.loadImage();
  const refreshRate = 5; // min
  const refreshDate = Date.now() + 1000 * 60 * refreshRate;
  widget.refreshAfterDate = new Date(refreshDate);
  widget.url = data.url;
  widget.setPadding(padd, padd, padd, padd);
  widget.backgroundImage = img;
  if (SHOW_TEXT) {
    // add gradient with a semi-transparent
    // dark section at the bottom. this helps
    // with the readability of the status line
    widget.backgroundGradient = newLinearGradient(
      ["#ffffff00", "#ffffff00", "#00000088"],
      [0, 0.8, 1]
    );
    // top spacer to push the bottom stack down
    widget.addSpacer();
    // horizontal stack to hold the status line
    const stats = widget.addStack();
    stats.layoutHorizontally();
    stats.centerAlignContent();
    stats.spacing = 3;
    addText(stats, data.text, "left", fontSize);
    stats.addSpacer();
  }
  return widget;
}
// -------- ERROR WIDGET -------- //
async function createErrorWidget(data) {
  const widget = new ListWidget();
  widget.addSpacer();
  const text = widget.addText(data.err_msg);
  text.textColor = Color.white();
  text.centerAlignText();
  widget.addSpacer();
  return widget;
}
