import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/", async (req, res) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto("https://optionbaaz.ir/options/%D8%A7%D9%87%D8%B1%D9%85/%D8%B6%D9%87%D8%B1%D9%851115", { waitUntil: 'networkidle0' });

  const rows = await page.evaluate(() => {
    const tableRows = Array.from(document.querySelectorAll("#tblOptionQuee tbody tr"));
    return tableRows.map((tr, i) => ({
      buy_count: document.getElementById(`${i+1}_buy_count`)?.innerText.trim() || "",
      buy_volume: document.getElementById(`${i+1}_buy_volume`)?.innerText.trim() || "",
      buy_price: document.getElementById(`${i+1}_buy_price`)?.innerText.trim() || "",
      sell_price: document.getElementById(`${i+1}_sell_price`)?.innerText.trim() || "",
      sell_volume: document.getElementById(`${i+1}_sell_volume`)?.innerText.trim() || "",
      sell_count: document.getElementById(`${i+1}_sell_count`)?.innerText.trim() || ""
    }));
  });

  await browser.close();
  res.json({ success: true, data: rows });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
