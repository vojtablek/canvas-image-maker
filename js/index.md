//importování dat claims = text
import { claims } from "./data.js";
//importování funkcí
import { splitText, pickRandom, getAverageLuminance } from "./helperFunctions.js";

//rozvržení loga
const LOGO_OFFSET_X = 525;
const LOGO_OFFSET_Y = 20;
//max. či min. světelnost pro použití typu logo
const LUMINANCE_THRESHOLD = 0.7;

//generování url z obrázků
const generators = "https://source.unsplash.com/800x800/?car"

//načtení obrázku?
const imageReader = new FileReader();

//logo světlé
const logoLight = new Image();
logoLight.src = "public/logo-light.png";

//logo tmavé
const logoDark = new Image();
logoDark.src = "public/logo-dark.png";

//prázdný obrázek
let currentImage = new Image();
//prázdný text
let currentText = "Test text";

//obnovit obrázek ASYNCHRONÍ
const rerollImage = async () => {
  //dostaň url
  const imageData = await fetch(generators);

  //new promise
  return new Promise((resolve) => {
    //prázdná obrázek
    const image = new Image();

    //po načtení obrázku
    image.addEventListener("load", () => {
      //prázdný obrázek = prázdný obrázek
      currentImage = image;
      //doděláno
      resolve();
    });

    //??
    image.crossOrigin = "anonymous";
    //uprvování zdroje prázdného obrázku na vygenerovanou url
    image.src = imageData.url;
  });
};

//obnovit text
const rerollText = () => {
  //dostat random text z claims
  currentText = pickRandom(claims);
};

//canvas
const canvas = document.getElementById("picture");
//canvas
const ctx = canvas.getContext("2d");
//importování fontu
const font = new FontFace("Bebas Neue", "url(font/BebasNeue-Regular.ttf)");

//nastavení fontu ASYNCHRONÍ
const initFont = async () => {
  //načtení
  await font.load();
  //přidání
  document.fonts.add(font);
};

//nastavení obrázku
const setFile = (file) => {
  //pokud to není obrázek => error
  if (!file.type.startsWith("image/")) {
    return;
  }

  //jinak nastavit jako url
  imageReader.readAsDataURL(file);
};

//po přejetí nad canvasem TODO ????
canvas.addEventListener("dragover", (e) => e.preventDefault());

//na "přetahování?" canvasu TODO ???
canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!e.dataTransfer || e.dataTransfer.files.length <= 0) {
    return;
  }

  setFile(e.dataTransfer.files[0]);
});

//přebarvení obrázku
const repaintImage = async () => {
  // na černou (pro .png)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // škalovat obrázek, aby vždy vyplnil canvas
  const scaleX = canvas.width / currentImage.width;
  const scaleY = canvas.height / currentImage.height;
  const scale = Math.max(scaleX, scaleY);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.drawImage(currentImage, 0, 0);
  ctx.setTransform(); // reset so that everything else is normal size

  // kalkuluj světlost, zjisti jestli bude logo bíle, či černé
  const imgd = ctx
    .getImageData(LOGO_OFFSET_X, LOGO_OFFSET_Y, logoLight.width, logoLight.height)
    .data;
  const luminanceAverage = getAverageLuminance(imgd);

  if (luminanceAverage > LUMINANCE_THRESHOLD) { //vykreslení loga
    ctx.drawImage(logoDark, LOGO_OFFSET_X, LOGO_OFFSET_Y);
  } else {
    ctx.drawImage(logoLight, LOGO_OFFSET_X, LOGO_OFFSET_Y);
  }

  const lines = splitText(currentText, 20).reverse(); //zalamování a ??otočení??
  const fontSize = lines.length < 5 ? 60 : 40;
  ctx.font = `${fontSize}px 'Bebas Neue'`; //font nastavení
  lines.forEach((line, index) => {
    const x = 30;
    const y = 685;
    const padding = 15;
    const lineHeight = padding + fontSize; //umístění
    ctx.fillStyle = "#f9dc4d"; //barva
    ctx
      .fillRect(x, y - (index * lineHeight), ctx.measureText(line).width + 2 * padding, lineHeight); //pozadí
    ctx.textBaseline = "top";
    ctx.fillStyle = "black";
    ctx.fillText(line, x + padding, y + padding - (index * lineHeight));
  });
};

//po načtení
imageReader.addEventListener("load", (e) => {
  //blank img
  currentImage = new Image();
  //po načtení img přebarvit
  currentImage.addEventListener("load", () => repaintImage());
  //nastavení img src
  currentImage.src = e.target.result;
});

//on click button random
const buttonRandom = document.getElementById("randomize");
buttonRandom.addEventListener("click", async () => {
  rerollText();
  await rerollImage();
  repaintImage();
});

//on click button random img
const buttonRandomImg = document.getElementById("randomize-img");
buttonRandomImg.addEventListener("click", async () => {
  await rerollImage();
  repaintImage();
});

//on click button random text
const buttonRandomText = document.getElementById("randomize-text");
buttonRandomText.addEventListener("click", () => {
  rerollText();
  repaintImage();
});

//vložení obrázku on change
const inputCustomImg = document.getElementById("customImage");
inputCustomImg.addEventListener("change", (e) => {
  //zruší autometizaci
  e.preventDefault();
  //pokud nic neinputne
  if (e.target.files.length <= 0) {
    //error
    return;
  }
  //když je vše ok nastav ???? TODO
  setFile(e.target.files[0]);
});

//vložení obrázku on click
const buttonCustomImg = document.getElementById("customImageBtn");
buttonCustomImg.addEventListener("click", () => {
  inputCustomImg.click();
});

//custom text ASYNCHRONÍ
const inputCustom = document.getElementById("customText");
const replaceWithCustomText = async (e) => {
  if (e.type === "input" || inputCustom.value) {
    //text je curtext
    currentText = inputCustom.value;
    //přebarvení obrázku
    repaintImage();
  }
};

//on click / input custom text
inputCustom.addEventListener("click", replaceWithCustomText);
inputCustom.addEventListener("input", replaceWithCustomText);

//stáhnutí
const downloadLinkReal = document.createElement("a");
downloadLinkReal.setAttribute("download", "PirStanKampan.jpg");
const linkSave = document.getElementById("save");
//on click
linkSave.addEventListener("click", (e) => {
  //zrušení akcí
  e.preventDefault();
  //stáhnout
  downloadLinkReal.setAttribute("href", canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream"));
  downloadLinkReal.click();
});

//init font
initFont();

//po rerollnutí textu
rerollText();
//reroll obrázek
rerollImage()
  //potom repaint img
  .then(() => repaintImage());
