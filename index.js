const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();

app.get("/", async (req, res) => {
  try {
    const response = await fetch("https://optionz.ir/watch");
    const body = await response.text();

    const $ = cheerio.load(body);
    const titles = [];
    $("a").each((i, el) => {
      titles.push($(el).text().trim());
    });

    res.json({ success: true, titles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
