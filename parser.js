const utils = require("./utils")
const fs = require("fs");
let detailsObj = [];

async function parsePage(page, browser) {
  let idx = 0;
  let cardList = [];
  detailsObj = [];
  do {
    await page.waitForSelector(".study-material-card", { visible: true });
    if (idx == cardList.length) {
      cardList = await page.$$(".study-material-card");
      console.log(cardList.length);
    }

    let card = cardList[idx];

    if (card === undefined) {
      break;
    }

    // if ((await page.$("ngx-ui-loader")) !== null) {
    //   await page.waitForSelector(".ngx-ui-loader", { visible: false });
    // }
    let newPage = await getBrowserPage(page, browser, card);
    await saveDetails(newPage);

    if ((await page.$(".bookshelf_wrapper")) !== null) {
      await page.waitForSelector(".bookshelf_wrapper", { visible: false });
    }

    idx++;
  } while (idx != cardList.length);

  return detailsObj;
}

async function getBrowserPage(page, browser, element) {
  await utils.delay(500);
  const pageTarget = await page.target();
  await element.click();
  const newTarget = await browser.waitForTarget(
    (target) => target.opener() === pageTarget
  );

  const newPage = await newTarget.page();
  return newPage;
}

async function saveDetails(page) {
  let object = {};
  let url = undefined;

  page.on("request", (r) => {
    if (r.resourceType() === "xhr" && r.url().includes(".pdf"))
      url = r.url();
  });

  await page.waitForSelector("ngx-ui-loader", { visible: false });

  await page.waitForSelector(".key");
  let keyArr = await page.$$(".key");
  let valArr = await page.$$(".value");

  for (let i = 0; i < keyArr.length; i++) {
    let keyText = await (
      await keyArr[i].getProperty("textContent")
    ).jsonValue();

    if (keyText == "Description") continue;

    let valText = await (
      await valArr[i].getProperty("textContent")
    ).jsonValue();

    object[keyText] = valText;
  }

  let type = await (await (await page.$("span.subject-name")).getProperty("textContent")).jsonValue();
  let views = await (await (await page.$("div.views")).getProperty("textContent")).jsonValue();
  let downloads = await (await (await page.$("div.downloads")).getProperty("textContent")).jsonValue();

  object["type"] = type;
  object["views"] = views;
  object["downloads"] = downloads;
  object["file"] = url;

  detailsObj.push(object);

  await page.close();
}

module.exports.parsePage = parsePage;
