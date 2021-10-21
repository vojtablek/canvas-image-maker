/* eslint-disable no-param-reassign */
//rozdělení textu text, max. počet písmen v řádku
export const splitText = (text, maxLineLength) => {
  //blank
const result = [];
//loop když je délka textu větší než  maxLineLength
while (text.length > maxLineLength) {
  //oddělí 1char a 20char, pokud je 20. mezera odebere ji
  let pos = text.substring(0, maxLineLength).lastIndexOf(" ");

  //kolikátý místo bylo max. odebráno (20 / 19)
  pos = pos <= 0 ? maxLineLength : pos;
  //dát do arraye text na 1 řádek
  result.push(text.substring(0, pos));
  //začátek nového řádku
  let i = text.indexOf(" ", pos) + 1;
  //pokud i < než pos / i< pos + maxLineLength tak se rovná
  if (i < pos || i > pos + maxLineLength) i = pos;
  //oddělit po řádkách
  text = text.substring(i);
}
result.push(text);
return result;
};

export const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const getAverageLuminance = (rgbData, pixelSkip = 6) => {
  const luminanceOf = (r, g, b) => (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
  let luminanceSum = 0;
  let luminanceDivisor = 0;
  for (let i = 0; i < rgbData.length; i += 3 * pixelSkip) {
    // +3 for R+G+B; pixelSkip because we don't need that many samples => less accurate, but faster!

    const [r, g, b] = [rgbData[i] / 255, rgbData[i + 1] / 255, rgbData[i + 2] / 255];
    const luminance = luminanceOf(r, g, b);
    if (!Number.isNaN(luminance)) {
      luminanceSum += luminance;
      luminanceDivisor += 1;
    }
  }

  return luminanceSum / luminanceDivisor;
};
