const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  let browser;
  try {
    // Launch a new browser instance
    browser = await puppeteer.launch({
      headless: false, // Set to true if you don't need to see the browser actions
      defaultViewport: null,
      args: ["--start-maximized"]
    });

    const page = await browser.newPage();

    // Navigate to eBay's homepage
    await page.goto('https://www.ebay.com/', { waitUntil: 'networkidle2' });
    console.log('Navigated to eBay homepage');

    // Wait for the "Shop by category" button to be available and visible
    await page.waitForSelector('#gh-shop-a', { visible: true });
    console.log('Shop by category button is visible');

    // Click the "Shop by category" button
    await page.click('#gh-shop-a');
    console.log('Clicked on Shop by category button');

    // Wait for the "Computers & tablets" link to be available and visible
    await page.waitForSelector('a[href="https://www.ebay.com/b/Computers-Tablets-Network-Hardware/58058/bn_1865247"]', { visible: true });
    console.log('Computers & tablets link is visible');

    // Click the "Computers & tablets" link
    await page.click('a[href="https://www.ebay.com/b/Computers-Tablets-Network-Hardware/58058/bn_1865247"]');
    console.log('Clicked on Computers & tablets link');

    // Wait for the category page to load and ensure tiles are visible
    await page.waitForSelector('.b-visualnav__tile a[href]', { visible: true });
    console.log('Category page loaded and visual navigation tiles are visible');

    // Extract and log the href attributes
    const hrefs = await page.evaluate(() => {
      const links = document.querySelectorAll('.b-visualnav__tile a[href]');
      return Array.from(links).map(link => link.href);
    });

    console.log('Extracted hrefs:', hrefs);

    // Save hrefs to a JSON file
    fs.writeFileSync('extracted_links.json', JSON.stringify(hrefs, null, 2));
    console.log('Links saved to extracted_links.json');

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Ensure browser is closed even if an error occurs
    if (browser) {
      await browser.close();
    }
  }
})();
