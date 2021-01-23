const puppeteer = require("puppeteer");
const fs = require("fs");

const INNO_URL = "https://www.innoscripta.de/";
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(INNO_URL);
  const response = await page.evaluate(() => {
    const INNO_URL = "https://www.innoscripta.de/";
    function calcElems(arr) {
      const occurrences = arr.reduce(function (obj, item) {
        obj[item] = (obj[item] || 0) + 1;
        return obj;
      }, {});
      const keyValues = [];
      for (let key in occurrences) {
        keyValues.push([key, occurrences[key]]);
      }
      keyValues.sort(function compare(kv1, kv2) {
        return kv2[1] - kv1[1];
      });
      return keyValues;
    }
    function getWordPairs() {
      const span = Array.from(document.querySelectorAll("html"));
      const content = span.map((span) => {
        return span["textContent"].trim().split(" ");
      });
      const flatContent = content.flat();
      const data = flatContent
        .map((elem) => elem.replace(/\n/gi, ""))
        .filter((elem) => !!elem);
      const keyValues = calcElems(data);
      console.log(keyValues);
      return keyValues;
    }
    function getLinks() {
      const links = Array.from(document.querySelectorAll("a"));
      const content = links
        .map((link) => {
          return link["href"];
        })
        //! should comment next filter for add anchors
        .filter((link) => link.indexOf("#") === -1);
      const keyValues = calcElems(content);
      return keyValues;
    }
    function getImg() {
      var divs = Array.from(document.querySelectorAll("div"));
      var imgs = divs
        .map((elem) => {
          var style = elem.currentStyle || window.getComputedStyle(elem, false);
          var bi = style.backgroundImage;
          return bi;
        })
        .filter((elem) => elem.indexOf("url") !== -1);
      let splitted = imgs
        .map((elem) => elem.split(", "))
        .flat()
        .map((elem) => elem.slice(elem.indexOf("assets"), -1).replace(/"/g, ""))
        .map((link) => INNO_URL + link);
      const keyValues = calcElems(splitted);
      return keyValues;
    }

    return [getWordPairs(), getLinks(), getImg()];
  });
  console.log(response);
  const headers = [
    "Words used in the text",
    "Links to other web pages",
    "Pictures used in the pages",
  ];
  const html = `<html><head></head><body><div style="width:100%; display: flex; border: 1px solid black; flex-flow: column nowrap; justify-content: center; align-items: flex-start">
  <div style="width:100%; display: flex; border: 1px solid black; flex-flow: row nowrap; justify-content: center; align-items: flex-start">
  ${headers.map(
    (header) =>
      `<h1 style="width: 30%; display:flex; justify-content: center"">${header}</h1>`
  )}
  </div>
  <div style="width:100%; display: flex; border: 1px solid black; flex-flow: row nowrap; justify-content: center; align-items: flex-start">
  ${response
    .map(
      (arr) =>
        `<div style="width:30%; display:flex; flex-flow: column nowrap; align-items: center">
                            ${arr
                              .map(
                                (elem) =>
                                  `<div  style="width: 100%; display: flex; flex-flow: row nowrap; justify-content: flex-start">
                                        <div style="width: 90%">
                                            ${elem[0]}
                                        </div>
                                        <div style="width: 10%">
                                            ${elem[1]}
                                        </div>
                                    </div>`
                              )
                              .join("")}
                        </div>`
    )
    .join("")}
    </div>
                </div></body></html>`;
  fs.writeFileSync("./result.html", html, "utf-8");
  await browser.close();
})();
