import express from "express";
import fetch from "node-fetch";
import { load } from "cheerio";

const app = express();

app.get("/", async (req, res) => {
  try {
    const response = await fetch("https://optionbaaz.ir/options/%D8%A7%D9%87%D8%B1%D9%85/%D8%B6%D9%87%D8%B1%D9%851115");
    const body = await response.text();

    const $ = load(body);
    const rows = [];

    $("#tblOptionQuee tbody tr").each((i, tr) => {
      const row = {
        buy_count: $(`#${i + 1}_buy_count`).text().trim(),
        buy_volume: $(`#${i + 1}_buy_volume`).text().trim(),
        buy_price: $(`#${i + 1}_buy_price`).text().trim(),
        sell_price: $(`#${i + 1}_sell_price`).text().trim(),
        sell_volume: $(`#${i + 1}_sell_volume`).text().trim(),
        sell_count: $(`#${i + 1}_sell_count`).text().trim(),
      };
      rows.push(row);
    });

    // اگر میخوای به سایتت هم POST بشه:
    /*
    await fetch(process.env.TARGET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: rows }),
    });
    */

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
