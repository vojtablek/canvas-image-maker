//importování dat claims = text
import { claims } from "./data.js";
//importování funkcí
import { splitText, pickRandom, getAverageLuminance } from "./helperFunctions.js";

//generování url z obrázků
let generators = "https://source.unsplash.com/800x800/?nature";

//načtení obrázku?
const imageReader = new FileReader();

let textColor = "black"

var lastSearch = " ";

let textAlign = "center";

let textPosition = "center";

let darkenLevel = '0';

//prázdný obrázek
let currentImage = new Image();
//prázdný text
let currentText = "Edit Text";

const bebas = new FontFace("Bebas Neue", "url(/font/bebas-neue/BebasNeue-Regular.ttf)");

const inter = new FontFace("Inter", "url(/font/inter/Inter-Regular.ttf)");

const noto = new FontFace("Noto Sans Mono", "url(/font/noto-sans-mono/NotoSansMono-Regular.ttf)");

const pacifico = new FontFace("Pacifico", "url(/font/pacifico/Pacifico-Regular.ttf)");

//obnovit obrázek ASYNCHRONÍ
const rerollImage = async () => {
  //dostaň url
  let imageData = await fetch(generators);
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

//canvas
const canvas = document.getElementById("picture");
//canvas
const ctx = canvas.getContext("2d");
//importování fontu
let font = bebas;

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

  //darken img
  ctx.fillStyle = 'rgba(0,0,0,0.' + darkenLevel + ')';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const lines = splitText(currentText, 20).reverse(); //zalamování a ??otočení??
  const firstArrNum = lines.length > 1 ? lines.length - 1 : 0;
  const fontSize = lines.length < 5 ? 60 : 40;
  let x = canvas.width / 2;
  //max center
  let y = (canvas.height / 2) + (fontSize * lines.length / 2);

  ctx.font = `${fontSize}px ${font.family}` //font nastavení
   lines.forEach((line, index) => {
    let textWidth = ctx.measureText(lines[firstArrNum]).width;
    //aligning
    if (textAlign == "left") {
      x = 100;
    } else if (textAlign == "right") {
      x = canvas.width - 100;
    };

    //y position
    if (textPosition == "top") {
      if (lines.length == 1) {
        y = 100;
      } else {
        y = 100 + fontSize * (lines.length - 1);
      }
    } else if (textPosition == "bottom") {
      y = canvas.width - 100;
    };
    const padding = 0;
    const lineHeight = padding + fontSize; //umístění
    /*
    ctx.fillStyle = "blue"; //barva pozadí
    ctx
      .fillRect(x, y - (index * lineHeight), ctx.measureText(line).width + 2 * padding, lineHeight); //pozadí
    */
    ctx.textBaseline = "center";
    ctx.fillStyle = textColor;
    ctx.textAlign = textAlign;
    // draw the text centered at [centerX,centerY]
    ctx.fillText(line, x, y - (index * lineHeight) + parseInt(ctx.font) / 4);
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
/* const buttonRandom = document.getElementById("randomize");
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
});*/

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
    //remove emojis
    let cleanText = inputCustom.value.replace(/[^a-zA-Z0-9 ]/gm, '');
    //text je curtext
    currentText = cleanText;
    console.log(currentText);
    //přebarvení obrázku
    repaintImage();
  }
};

//on click / input custom text
inputCustom.addEventListener("click", replaceWithCustomText);
inputCustom.addEventListener("input", replaceWithCustomText);
inputCustom.addEventListener("paste", replaceWithCustomText);

//custom img src ASYNCHRONÍ
const inputImgCustom = document.getElementById("typeImg");
const inputImgCustomSearch = document.getElementById("searchimgbtn");
const replaceWithCustomImgSrc = async (e) => {
  if (e.type === "input" || inputImgCustom.value) {

    //animate again svg
    if (lastSearch == inputImgCustom.value) {
      document.getElementById("repeatsvg").setAttribute('class', 'againrotate');
      console.log("done");
      setTimeout(function(){
        document.getElementById("repeatsvg").setAttribute('class', ' ');
      }, 600);
    };

    //text je curtext
    lastSearch = inputImgCustom.value;
    generators = "https://source.unsplash.com/800x800/?" + inputImgCustom.value;

    //magnifier to repeat
    document.getElementById("magnifiersvg").style.display = "none"
    document.getElementById("repeatsvg").style.display = "block"

    //přebarvení obrázku
    await rerollImage();
    repaintImage();
  }
};

//on click / input custom img src
inputImgCustomSearch.addEventListener("click", replaceWithCustomImgSrc);
inputImgCustomSearch.addEventListener("change", replaceWithCustomImgSrc);

const inputImgRandomSearch = document.getElementById("randomimg");
const replaceWithRandomImgSrc = async (e) => {
  //animace on click
  document.getElementById("cubeSvg").setAttribute('class', 'cuberotate');
  setTimeout(function(){
    document.getElementById("cubeSvg").setAttribute('class', ' ');
}, 600);

  //text je curtext
  generators = "https://source.unsplash.com/random/800x800/?";

  //přebarvení obrázku
  await rerollImage();
  repaintImage();
};

//on click / input custom img src
inputImgRandomSearch.addEventListener("click", replaceWithRandomImgSrc);
inputImgRandomSearch.addEventListener("change", replaceWithRandomImgSrc);

//update icon to magnifier
const updateIconSearchBtn = async (e) => {
  if (e.type === "input" || inputImgCustom.value) {
    if (lastSearch != inputImgCustom.value) {
      document.getElementById("magnifiersvg").style.display = "block"
      document.getElementById("repeatsvg").style.display = "none"
    }
  }
};

//on click / input custom img src
inputImgCustom.addEventListener("click", updateIconSearchBtn);
inputImgCustom.addEventListener("input", updateIconSearchBtn);

//align buttons
const alignLeft = document.getElementById("alignleft");
const alignCenter = document.getElementById("aligncenter");
const alignRight = document.getElementById("alignright");

//update icon to magnifier
const setAlignRight = async => {
  textAlign = "right";
  repaintImage();
};

//update icon to magnifier
const setAlignLeft = async => {
  textAlign = "left";
  repaintImage();
};

//update icon to magnifier
const setAlignCenter = async => {
  textAlign = "center";
  repaintImage();
};

//on click / input change align
alignLeft.addEventListener("click", setAlignRight);
alignCenter.addEventListener("click", setAlignCenter);
alignRight.addEventListener("click", setAlignLeft);

//align buttons
const positionTopButton = document.getElementById("postop");
const positionCenterButton = document.getElementById("poscenter");
const positionBottomButton = document.getElementById("posbottom");

//update icon to magnifier
const setPositionTop = async => {
  textPosition = "top";
  repaintImage();
};

//update icon to magnifier
const setPositionCenter = async => {
  textPosition = "center";
  repaintImage();
};

//update icon to magnifier
const setPositionBottom = async => {
  textPosition = "bottom";
  repaintImage();
};

//on click / input change align
positionTopButton.addEventListener("click", setPositionTop);
positionCenterButton.addEventListener("click", setPositionCenter);
positionBottomButton.addEventListener("click", setPositionBottom);

//custom text barva ASYNCHRONÍ
const inputTextColorCustom = document.getElementById("colorPicker");
const repaintColorText = async (e) => {
  //text je curtext
  textColor = inputTextColorCustom.value;
  //přebarvení obrázku
  repaintImage();
  console.log(textColor);
};

inputTextColorCustom.addEventListener("change", repaintColorText);
inputTextColorCustom.addEventListener("input", repaintColorText);

//custom  font ASYNCHRONÍ
const inputTextFontCustom = document.getElementById("fontselect");
const changeTextFont = async (e) => {
  let val = inputTextFontCustom.value
  if (val == "noto") {
    font = noto;
    inputTextFontCustom.style.fontFamily = font.family
  } else if (val == "inter") {
    font = inter;
    inputTextFontCustom.style.fontFamily = font.family
  } else if (val == "pacifico") {
    font = pacifico;
    inputTextFontCustom.style.fontFamily = font.family
  } else if (val == "bebas") {
    font = bebas;
    inputTextFontCustom.style.fontFamily = font.family
  };
  await initFont();
  repaintImage();
};

//on click / input custom img src
inputTextFontCustom.addEventListener("change", changeTextFont);
inputTextFontCustom.addEventListener("input", changeTextFont);

const darkenLevelRange = document.getElementById("darkenrange");
const darkenImage = async (e) => {
  //nastav desetinné číslo tmavosti
  if (darkenLevelRange.value == 5) {
    darkenLevel = 0 + darkenLevelRange.value;
  } else {
    darkenLevel = darkenLevelRange.value;
  }

  console.log(darkenLevel);

  //přebarvení obrázku
  repaintImage();
};

//on click / input custom img src
darkenLevelRange.addEventListener("input", darkenImage);
darkenLevelRange.addEventListener("change", darkenImage);

/*
//stáhnutí
const downloadLinkReal = document.createElement("a");
downloadLinkReal.setAttribute("download", "CanvasImageMaker.jpg");
const linkSave = document.getElementById("save");
//on click
linkSave.addEventListener("click", (e) => {
  //zrušení akcí
  e.preventDefault();
  //stáhnout
  downloadLinkReal.setAttribute("href", canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream"));
  downloadLinkReal.click();
});
*/

//init font
initFont();

//reroll obrázek
rerollImage()
  //potom repaint img
  .then(() => repaintImage());
