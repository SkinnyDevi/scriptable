// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: chart-bar;
// version: 1.0.1
// author: SkinnyDevi (GitHub)

import {
  config,
  Script,
  ListWidget,
  Font,
  WebView,
  Color,
  Alert,
  WidgetStack,
  LinearGradient,
  Request,
  args,
} from "nios-scriptable";

// -------- USER CONFIG ------- //
const PRODUCT_URL: string | null = args.widgetParameter;

const PRODUCT_IMAGE = `
https://media.istockphoto.com/id/1169630303/photo/blue-textured-background.webp?b=1&s=170667a&w=0&k=20&c=tI2xFhXqXFqMM0IvxSYY3F7LIwv450h2ch3yD-lZ9HU=
`;

const USE_ENG = false;
const SHOW_TEXT = true;

// -------- MAIN CODE ---------- //
async function mainScript() {
  const displayer = await productFetcher();

  if (config.runsInWidget) {
    let widget = displayer.has_error
      ? await createErrorWidget(displayer as ProductInfoError)
      : await createWidget(displayer as ProductInfo, null);
    Script.setWidget(widget);
  } else {
    const options = ["Small", "Medium", "Large", "Cancel"];
    let resp = await presentAlert("Preview Widget", options, false);
    if (resp == options.length - 1) return;
    let size = options[resp];
    let widget = displayer.has_error
      ? await createErrorWidget(displayer as ProductInfoError)
      : await createWidget(displayer as ProductInfo, size.toLowerCase());

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

interface ProductInfo {
  has_error: boolean;
  imgUrl: string;
  url: string;
  text: string;
}

interface ProductInfoError {
  has_error: boolean;
  err_msg: string;
}

// -------- PRODUCT FETCHER --------- //
async function productFetcher(): Promise<ProductInfo | ProductInfoError> {
  if (PRODUCT_URL === null) {
    return {
      has_error: true,
      err_msg: USE_ENG
        ? "This text was displayed because no URL was specified."
        : "No se ha proporcionado un enlace para buscar el producto.",
    };
  }

  const htmlString = await new Request(PRODUCT_URL.trim()).loadString();

  const dataFetcher = `
    function fetchData() {
      const isCanary = "${PRODUCT_URL}".includes("/canarias/");
      const scriptCheckerStr = isCanary ? '[{"page"' : 'dataLayer = [{"';
      const infoScript = document.querySelectorAll('script');
      let correctScript = null;
      for (let i = isCanary ? 10 : 5; i < infoScript.length; i++) {
        const script = infoScript[i].textContent;
        if (script.includes(scriptCheckerStr)) {
          correctScript = script.slice(12, script.length - 1);
          return correctScript.split(";")[0].trim();
        }
      }
      
      return correctScript;
    }
  
    fetchData();
  `;

  const webview = new WebView();
  await webview.loadHTML(htmlString, PRODUCT_URL.trim());

  let response = await webview.evaluateJavaScript(dataFetcher);

  if (response === null) {
    return {
      has_error: true,
      err_msg: "This text is displayed because there was an error",
    };
  }

  response = JSON.parse(response)[0];
  console.log(response);

  const prodName = response.product.name.substr(0, 21);
  const productPrice = response.product.price.f_price;
  const discountP = response.product.price.discount_percent;

  const imageUrl = PRODUCT_IMAGE;
  const now = new Date();
  const nowRefresh = now.toLocaleTimeString();

  const priceLabel = USE_ENG ? "Price" : "Precio";
  const discountLabel = USE_ENG ? "Discount" : "Descuento";
  const checkLabel = USE_ENG ? "Last Check" : "Ultimo Checkeo";

  return {
    has_error: false,
    imgUrl: imageUrl,
    url: PRODUCT_URL.trim(),
    text: `${prodName} - ${priceLabel}: ${productPrice}€
${discountLabel} ${discountP}%
${checkLabel}: ${nowRefresh}`,
  };
}

// -------- UTILS -------- //
function addText(
  container: WidgetStack,
  text: string,
  align: string,
  size: number
) {
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

function newLinearGradient(hexcolors: string[], locations: number[]) {
  let gradient = new LinearGradient();
  gradient.locations = locations;
  gradient.colors = hexcolors.map((color) => new Color(color));
  return gradient;
}

async function presentAlert(prompt: string, items: string[], asSheet: boolean) {
  let alert = new Alert();
  alert.message = prompt;

  for (const item of items) {
    alert.addAction(item);
  }
  return asSheet ? await alert.presentSheet() : await alert.presentAlert();
}

// -------- WIDGET -------- //
async function createWidget(data: ProductInfo, widgetFamily: string | null) {
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
async function createErrorWidget(data: ProductInfoError) {
  const widget = new ListWidget();
  widget.addSpacer();
  const text = widget.addText(data.err_msg);
  text.textColor = Color.white();
  text.centerAlignText();
  widget.addSpacer();
  return widget;
}
