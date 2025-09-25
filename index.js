import express from "express";
import puppeteer from "puppeteer";
import fetch from "node-fetch"; // npm install node-fetch@3.3.2

const app = express();

function cleanText(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replace(/\u00A0/g, " ") // non-breaking space
    .replace(/\s+/g, " ")    // چند فاصله → یکی
    .replace(/^\s+|\s+$/g, "")
    .replace(/,/g, "");      // حذف ویرگول برای اعداد
}

app.get("/", async (req, res) => {
  const targetUrl = "https://optionbaaz.ir/options/%D8%A7%D9%87%D8%B1%D9%85/%D8%B6%D9%87%D8%B1%D9%851115";

  let browser;
  try {
    browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // صبر کن 10 ثانیه تا JS جدول را بسازد
    await page.waitForTimeout(10000);

    // داده‌ها را از جدول بخوان
    const rows = await page.$$eval("#tblOptionQuee tbody tr", trs => {
      return trs.map(tr => {
        const tds = Array.from(tr.querySelectorAll("td"));
        return {
          buy_count: tds[0]?.innerText.trim() || "",
          buy_volume: tds[1]?.innerText.trim() || "",
          buy_price: tds[2]?.innerText.trim() || "",
          sell_price: tds[3]?.innerText.trim() || "",
          sell_volume: tds[4]?.innerText.trim() || "",
          sell_count: tds[5]?.innerText.trim() || "",
        };
      });
    });

    // اختیاری: ارسال به سایت خودت
    if (process.env.TARGET_URL) {
      await fetch(process.env.TARGET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: targetUrl, data: rows }),
      });
    }

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("scrape error:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
