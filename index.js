import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/", async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto("https://optionbaaz.ir/options/%D8%A7%D9%87%D8%B1%D9%85/%D8%B6%D9%87%D8%B1%D9%851115", {
      waitUntil: "networkidle2",
      timeout: 30000
    });

    const rows = await page.evaluate(() => {
      const table = document.querySelector("#tblOptionQuee tbody");
      if (!table) return [];
      const trs = Array.from(table.querySelectorAll("tr"));
      return trs.map((tr, i) => {
        const idx = i + 1;
        const g = id => (document.getElementById(id)?.innerText || "").trim();
        return {
          buy_count: g(`${idx}_buy_count`),
          buy_volume: g(`${idx}_buy_volume`),
          buy_price: g(`${idx}_buy_price`),
          sell_price: g(`${idx}_sell_price`),
          sell_volume: g(`${idx}_sell_volume`),
          sell_count: g(`${idx}_sell_count`)
        };
      });
    });

    // اگر میخوای به سایتت ارسال کنی، اینجا POST بزن
    /*
    await fetch(process.env.TARGET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: rows })
    });
    */

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("scrape error:", err);
    res.status(500).json({ success: false, error: String(err) });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
