const fs = require("fs");

async function credentialsParser(credentialsFile) {
  const credentialsData = await fs.promises.readFile(credentialsFile);
  const credentialsObject = JSON.parse(credentialsData);
  return credentialsObject;
}

async function openWebsite(page) {
  await page.goto("https://noteshub.co.in/", {
    waitUntil: "networkidle0",
  });
}

async function gotoLoginPage(page, credsFile) {
  await page.waitForSelector("ngx-ui-loader", { visible: false });

  await page.waitForSelector(".nav-item.ng-star-inserted", {
    visible: true,
  });

  await page.click(".nav-item.ng-star-inserted");

  await enterCredentials(page, credsFile);
}

async function enterCredentials(page, credsFile) {
  let { username, password } = JSON.parse(credsFile);
  await page.waitForSelector(".auth-wrapper");

  await page.type("input[type=email]", username, { delay: 20 });
  await page.type("input[type=password]", password, { delay: 20 });

  await page.click(".button.button-shadow.button-green", {
    waitUntil: "networkidle0",
  });

  await page.waitForNavigation("networkidle2");
  await page.waitForSelector("ngx-ui-loader", { visible: false });
}

module.exports.openWebsite = openWebsite;
module.exports.gotoLoginPage = gotoLoginPage;
