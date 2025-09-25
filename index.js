import express from "express";
import fetch from "node-fetch";
import { load } from "cheerio";  // <- اصلاح شد

const app = express();

app.get("/", async (req, res) => {
  try {
    const response = await fetch("https://optionz.ir/watch");
    const body = await response.text();

    const $ = load(body);  // بجای cheerio()
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
