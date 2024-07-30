const puppeteer = require('puppeteer');
const fs = require('fs');

// Load existing data from the file, or initialize an empty object if the file does not exist
const getExistingData = () => {
    try {
        return JSON.parse(fs.readFileSync('items_data.json', 'utf8'));
    } catch (e) {
        return {};
    }
};

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

        // Read the links from the JSON file
        const data = fs.readFileSync('extracted_links.json', 'utf8');
        const hrefs = JSON.parse(data);

        // Load existing data
        const allItems = getExistingData();

        if (hrefs.length > 0) {
            for (const initialLink of hrefs) {
                console.log('Navigating to:', initialLink);

                // Navigate to the first page
                await page.goto(initialLink, { waitUntil: 'networkidle2' });
                console.log('Navigated to the page');

                let hasNextPage = true;

                while (hasNextPage) {
                    // Extract the desired information
                    const itemsData = await page.evaluate(() => {
                        const items = {};
                        const ulElement = document.querySelector('ul.b-list__items_nofooter');
                        if (ulElement) {
                            const lis = ulElement.querySelectorAll('li.s-item.s-item--large');
                            lis.forEach(li => {
                                const linkElement = li.querySelector('a.s-item__link');
                                const titleElement = li.querySelector('h3.s-item__title');
                                const priceElement = li.querySelector('span.s-item__price');
                                const soldElement = li.querySelector('span.s-item__hotness');

                                const style = window.getComputedStyle(li);
                                if (style.display !== 'none') {
                                    const itemId = linkElement ? linkElement.href : Date.now(); // Unique key
                                    items[itemId] = {
                                        href: linkElement ? linkElement.href : null,
                                        title: titleElement ? titleElement.innerText.trim() : null,
                                        price: priceElement ? priceElement.innerText.trim() : null,
                                        sold: soldElement ? soldElement.innerText.trim() : null
                                    };
                                }
                            });
                        }
                        return items;
                    });

                    // Merge the new items data with the existing data
                    Object.assign(allItems, itemsData);

                    console.log('Extracted items data:', itemsData);

                    // Save the data to a file
                    fs.writeFileSync('items_data.json', JSON.stringify(allItems, null, 2));

                    // Click the "Next" page link
                    const nextPageSelector = 'a.pagination__next.icon-link';
                    const nextPageExists = await page.evaluate(selector => {
                        return !!document.querySelector(selector);
                    }, nextPageSelector);

                    if (nextPageExists) {
                        console.log('Clicking the "Next" page link');
                        await Promise.all([
                            page.waitForNavigation({ waitUntil: 'networkidle2' }),
                            page.click(nextPageSelector)
                        ]);
                    } else {
                        hasNextPage = false; // No more pages
                    }
                }
            }
        } else {
            console.log('No links found in extracted_links.json.');
        }

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        // Ensure browser is closed even if an error occurs
        if (browser) {
            await browser.close();
        }
    }
})();
