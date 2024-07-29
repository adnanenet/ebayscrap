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

        // Read the links from the JSON file
        const data = fs.readFileSync('extracted_links.json', 'utf8');
        const hrefs = JSON.parse(data);

        if (hrefs.length > 0) {
            const firstLink = hrefs[0];
            console.log('Navigating to the first link:', firstLink);

            // Navigate to the first link
            await page.goto(firstLink, { waitUntil: 'networkidle2' });
            console.log('Navigated to the first link');

            // Extract and filter list items
            const listItems = await page.evaluate(() => {
                const items = [];
                // Select the list within the specified class
                const ulElement = document.querySelector('ul.b-list__items_nofooter');
                if (ulElement) {
                    // Get all list items within the ul
                    const lis = ulElement.querySelectorAll('li.s-item.s-item--large');
                    lis.forEach(li => {
                        // Log the li content
                        console.log('Raw li content:', li.outerHTML);

                        // Check if the item is not hidden
                        const style = window.getComputedStyle(li);
                        if (style.display !== 'none') {
                            items.push(li.innerText.trim());
                        }
                    });
                }
                return items;
            });

            console.log('Filtered list items:', listItems);

            // Optionally: Save the list items to a file or perform further actions
            // fs.writeFileSync('list_items.json', JSON.stringify(listItems, null, 2));

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
