# Unlimited SimilarWeb Extension For Chrome

The Similarweb Chrome extension hooks you up with basic stats like traffic, global and country ranks, bounce rates, geo info, traffic sources, screenshots, and categories. Sneakily enough, there’s an undocumented API endpoint you can spot using the extension’s source view. It spits out free data for any domain without needing pesky API keys. For example, you can plug in a domain like github.com and grab info from:

https://data.similarweb.com/api/v1/data?domain=github.com

- Clone this repository
- Open Chrome and go to chrome://extensions/.
- Enable "Developer mode" using the toggle switch in the top-right corner.
- Click the "Load unpacked" button and select the directory containing these files.


Based on the internal API of Similarweb which doesn't need any Api key - https://data.similarweb.com/api/v1/data?domain=github.com
- Used Cloudflare worker to create a reverse proxy from this API url so each request will be from a new IP. 
- Unlmited Data


The styling currently sucks becasuse I didn't want to spend too much time on styling. If it works, it works.