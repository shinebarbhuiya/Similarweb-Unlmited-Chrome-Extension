# Unlimited SimilarWeb Extension For Chrome
- Open Chrome and go to chrome://extensions/.
- Enable "Developer mode" using the toggle switch in the top-right corner.
- Click the "Load unpacked" button and select the directory containing these files.


Based on the internal API of similarweb - https://data.similarweb.com/api/v1/data?domain=github.com
- Used Cloudflare worker to create a reverse proxy from this API url so each request will be from a new IP. 
- Unlmited Data


The styling currently sucks becasuse I didn't want to spend too much time on styling. If it works, it works.