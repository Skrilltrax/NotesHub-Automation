let utils = require("./utils");

async function openSearchPage(page) {
  await page.goto("https://noteshub.co.in/", { waitUntil: "networkidle2" });
  await page.waitForSelector("ngx-ui-loader", { visible: false });
}

async function searchQuery(page, query) {
  await page.type(".ng-tns-c7-3.ui-inputtext", query);
  await page.waitForSelector("li[role=option]");

  let options = await page.$$("li[role=option]");
  await options[0].click();
  await page.waitForNavigation("networkidle2");
}

async function filterResults(page, type) {
  await page.waitForSelector("ngx-ui-loader", { visible: false });
  await page.click(".ui-dropdown");
  await page.waitForSelector(".bookshelf_wrapper", { visible: false });

  let optionList = await page.$$("li.ui-dropdown-item");

  await page.waitForSelector(".study-material-card", { visible: true });

  for (let i = 0; i < optionList.length; i++) {
    let optionText = await (
      await optionList[i].getProperty("textContent")
    ).jsonValue();

    if (optionText === type) {
      await optionList[i].click();
      break;
    }
  }

  await page.waitForSelector(".bookshelf_wrapper", { visible: false });

}

module.exports.openSearchPage = openSearchPage;
module.exports.searchQuery = searchQuery;
module.exports.filterResults = filterResults;
