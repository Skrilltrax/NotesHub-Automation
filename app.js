const fs = require("fs");
const pup = require("puppeteer");
const login = require("./login");
const search = require("./search");
const parser = require("./parser");
const utils = require("./utils");

let subjects = [];
let credsFile;
let useCredentials = true;
let browser;
let type = "All";

async function init() {
  let page = null;
  try {
    await parseArguments();
    browser = await pup.launch({
      headless: false,
      args:['--start-maximized'],
      defaultViewport: null,
    });
    let pages = await browser.pages();
    page = pages[0];
  } catch (error) {
    console.error(error);
  } finally {
    return page;
  }
}

async function parseArguments() {
  if (process.argv[2] == "help") {
    //TODO: Do something
  } else if (process.argv.length < 3) {
    console.log("Incorrect number of arguments passed.");
    console.log("Try running `node app.js help`");
    process.exit();
  }

  if (process.argv[3] == "NO_CREDENTIALS") {
      useCredentials = false;
  } else {
      credsFile = await fs.promises.readFile(process.argv[3]);
  }

  if (process.argv[4] == "Notes") {
      type = "Notes"
  } else if (process.argv[4] == "Question Papers") {
    type = "Question Papers"
  } else if (process.argv[4] == "Practical Files") {
    type = "Practical Files"
  } else if (process.argv[4] == "Ebooks") {
    type = "Ebooks"
  }

  let subjectsFile = await fs.promises.readFile(process.argv[2]);
  subjects = JSON.parse(subjectsFile)["subjects"];
}

async function automateLogin(page) {
  try {
    await login.openWebsite(page);

    if (useCredentials) {
      await login.gotoLoginPage(page, credsFile);
    }
  } catch (error) {
    console.error("Error while logging in \n\n" + error);
  }
}

async function automateSearching(page, index) {
    await search.openSearchPage(page);
    await search.searchQuery(page, subjects[index]);
    if (type !== "All") {
      await search.filterResults(page, type);
    }
}

async function automateParsing(page, index) {
  let data = await parser.parsePage(page, browser);
  let table = utils.json2table(data);
  
  if (!fs.existsSync("./out")) {
    fs.promises.mkdir("./out");
  }

  let filePath = "./out/" + subjects[index] + ".html";
  await fs.promises.writeFile(filePath, utils.wrapInHtmlTemplate(table));
}

async function main() {
  let page = null;
  try {
    page = await init();
    if (page == undefined || page == null) {
      console.error("Initialization failed");
      return;
    }
  } catch (error) {
    console.error("Error while getting page \n" + error);
  }

  await automateLogin(page);

  for (let i = 0; i < subjects.length; i++) {
    await automateSearching(page, i);
    await automateParsing(page, i);
  }
}

main();
