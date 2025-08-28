import { chromium } from "playwright-core";
import { loadOtegaru } from "./otegaru";
import { loadTohoBiz } from "./toho-biznet";
import { IS_TEST, formatDate, isExecDate } from "./utils";

(async () => {
  if (!IS_TEST && !isExecDate(new Date())) {
    // テストじゃなくて実行日ではない場合は実行しない
    return console.warn("today is not exec date");
  }
  console.log(formatDate(new Date()));
  console.log("program start!");
  // ブラウザ起動時設定
  const args: string[] = [
    "--mute-audio", // 音声をミュート
    "--no-default-browser-check", // デフォルトブラウザチェックを無効
    "--no-first-run", // 初回起動時の設定を無効
    "--disable-cache", // キャッシュを無効
    "--disable-background-networking", // バックグラウンドネットワーキングを無効
    "--disable-breakpad", // クラッシュレポートを無効
  ];
  const browser = await chromium.launch({
    headless: !IS_TEST,
    channel: "chrome",
    args,
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.133 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    // await loadTohoBiz(page);
    await loadOtegaru(page);
  } catch (e) {
    console.debug(e);
  } finally {
    await page.close();
    await browser.close();
  }
})();
