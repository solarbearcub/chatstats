# ChatStats

Based loosely on [ChanStat](https://chanstat.net/) which is used to find "insights" on IRC channels, ChatStats uses Telegram's JSON chat export to generate similar insights.

## How to use

1. Export conversation data from Telegram using the `Export chat history` option. Ensure it's set to `JSON`.
2. Place the `result.json` file generated by Telegram in this directory. (or update the import in `generate_stats_obj.js` to point to your file)
3. `NODE_NO_WARNINGS=1 node generate_stats_obj.js > data.js`
4. Load `index.html` via a browser.
