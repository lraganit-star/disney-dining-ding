const fs = require("fs");

const playwright = require("playwright");
const puppeteer = require("puppeteer-extra");
const stealth = require("puppeteer-extra-plugin-stealth");
const chromium = playwright.chromium;
puppeteer.use(stealth());

const link = `https://disneyworld.disney.go.com/dine-res/restaurant/space-220`;
const cookiesFilePath = "./cookies.json";

main();

async function main() {
  // For some reason we need to run it in headful mode, otherwise the bot detection catches us
  const browser = await chromium.launch({
    // devtools: true
    headless: false,
  });
  require("dotenv").config();
  const page = await browser.newPage();
  const loadedCookies = await loadCookies(page);
  await page.goto(link);
  console.log(loadedCookies);

  if (loadedCookies === "No cookies found") {
    console.log("login process started");
    await loginToDisneyUsingEmailPassword(page);
    await saveCookies(page);
    console.log("login process ended");
  }

  console.log("looking for reservation");
  await wtf(page);
  await saveCookies(page);

  process.exit();
}

async function loadCookies(page) {
  const previousCookies = fs.existsSync(cookiesFilePath)
    ? JSON.parse(fs.readFileSync(cookiesFilePath))
    : [];

  if (previousCookies.length !== 0) {
    await page.context().addCookies(previousCookies);
    console.log("Loaded cookies");
    return "Loaded cookies";
  } else {
    console.log("No cookies found");
    return "No cookies found";
  }
}

async function saveCookies(page) {
  const cookies = await page.context().cookies();
  fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies));
  console.log("Cookies saved");
}

async function loginToDisneyUsingEmailPassword(page) {
  const { email, password } = {
    email: process.env.EMAIL,
    password: process.env.DISNEY_PASSWORD,
  };

  await page.goto(link);
  await page
    .frameLocator('iframe[name="oneid-iframe"]')
    .getByTestId("IDENTITY_FLOW-close")
    .click();
  await page
    .frameLocator('iframe[name="oneid-iframe"]')
    .getByTestId("InputIdentityFlowValue")
    .click();
  await page
    .frameLocator('iframe[name="oneid-iframe"]')
    .getByTestId("InputIdentityFlowValue")
    .fill(email);
  await page
    .frameLocator('iframe[name="oneid-iframe"]')
    .getByTestId("BtnSubmit")
    .click();
  await page
    .frameLocator('iframe[name="oneid-iframe"]')
    .getByTestId("InputPassword")
    .click();
  await page
    .frameLocator('iframe[name="oneid-iframe"]')
    .getByTestId("InputPassword")
    .fill(password);
  await page
    .frameLocator('iframe[name="oneid-iframe"]')
    .getByTestId("BtnSubmit")
    .click();

  const cookies = await page.context().cookies();
  fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies));
}

async function wtf(page) {
  await page.getByLabel("Party Size 2").click();
  await page
    .locator("dpep-calendar-picker")
    .getByRole("button", { name: "" })
    .click();
  await page.getByLabel("Thursday, January 4, 2024").click();
  const text = await page.getByRole("combobox", { name: "Time" }).textContent();
  console.log(text);
}
