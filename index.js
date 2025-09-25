// index.js  (ESM)
import express from "express";
import fetch from "node-fetch";
import { load } from "cheerio";

const app = express();

function cleanText(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replace(/\u00A0/g, " ")   // non-breaking space
    .replace(/\s+/g, " ")      // چند فاصله -> یکی
    .replace(/^\s+|\s+$/g, "") // trim
    .replace(/,/g, "");        // حذف ویرگول اگر خواستی عدد خام بدست بیاد
}

app.get("/", async (req, res) => {
  try {
    const targetUrl = "https://optionbaaz.ir/options/%D8%A7%D9%87%D8%B1%D9%85/%D8%B6%D9%87%D8%B1%D9%851115";
    const resp = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "fa-IR,fa;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Referer": "https://optionbaaz.ir/",
      },
      timeout: 20000
    });

    const body = await resp.text();

    // -- دیباگ سریع: بررسی وجود جدول --
    const $ = load(body);
    if ($("#tblOptionQuee").length === 0) {
      // جدول پیدا نشده — برای دیباگ بد نیست HTML خام رو لاگ کنیم (یا طولش رو)
      console.error("tblOptionQuee not found in fetched HTML. body length:", body.length);
      // در صورت نیاز می‌تونی body را به فایل بنویسی یا از طریق لاگ مستقیم ببینی
      return res.json({ success: false, error: "table_not_found", body_length: body.length });
    }

    // -- پردازش ردیف‌ها --
    const rows = [];
    $("#tblOptionQuee tbody tr").each((i, tr) => {
      const tds = $(tr).find("td");
      // ترتیب ستون‌ها: تعداد | حجم | قیمت | قیمت | حجم | تعداد
      const row = {
        buy_count: cleanText(tds.eq(0).text()),   // ستون 1
        buy_volume: cleanText(tds.eq(1).text()),  // ستون 2
        buy_price: cleanText(tds.eq(2).text()),   // ستون 3
        sell_price: cleanText(tds.eq(3).text()),  // ستون 4
        sell_volume: cleanText(tds.eq(4).text()), // ستون 5
        sell_count: cleanText(tds.eq(5).text()),  // ستون 6
      };
      rows.push(row);
    });

    // اختیاری: ارسال به سایت خودت اگر متغیر محیطی ست شده
    if (process.env.TARGET_URL) {
      try {
        await fetch(process.env.TARGET_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: targetUrl, data: rows }),
          timeout: 10000
        });
      } catch (errPost) {
        console.error("POST to TARGET_URL failed:", errPost.message);
      }
    }

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("scrape error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
