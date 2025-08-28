import { Locator, Page } from "playwright-core";
import { checkUrl, createClickOption, fill } from "./playwright-common";
import { sleep, loadJsonOtegaru, convertYMtoYYYYMM01 } from "./utils";
import { postChargeInfo } from "./gas";

const LOGIN_URL = "https://web-kensin.jp/login/tohoekika";

/**
 * おてがるガスnetからデータをダウンロードする
 * @param page
 * @param data 元になるデータ
 */
export async function loadOtegaru(page: Page) {
  console.log("loadOtegaru start");

  await login(page);

  const csv = await moveToTargetPage(page);
  console.log(csv.map((v) => v.join(",")).join("\n"));
  await postChargeInfo(csv);
}

/**
 * ログインする
 * @param page
 */
async function login(page: Page) {
  console.log("login start");
  await page.goto(LOGIN_URL);
  await sleep(1);

  const json = loadJsonOtegaru();

  console.debug("login page opened");

  await page.locator("input#loginid").waitFor({ state: "visible" });

  // id入力
  await fill(page, "input#loginid", json.id);

  // パスワードを入力
  await fill(page, "input#loginpw", json.password);

  await sleep(2);

  // ログインボタンクリック
  const submitLocator = page.locator(`div.c_btn input#sndbtn[type="submit"]`);
  await submitLocator.waitFor({ state: "visible" });
  await submitLocator.click();
  await page.waitForEvent("load");

  await sleep(5);

  console.log("url: ", page.url());

  if (!page.url().startsWith("https://web-kensin.jp/home")) {
    await login(page);
  }

  await sleep(0.5);
}

/**
 * 目的のページへ移動する
 * @param page
 */
async function moveToTargetPage(page: Page) {
  const anchorLocator = page
    .locator(`ul.info-list li.info-list_item a.info-list_item_box`)
    .getByText("複数契約", { exact: true });

  await anchorLocator.waitFor({ state: "visible" });
  await anchorLocator.click(createClickOption());
  await sleep(2);

  checkUrl(page, "https://web-kensin.jp/user/userselect");

  const anchorLocators = await page.locator(
    `ul.info-list li.info-list_item a.info-list_item_box`
  );
  await anchorLocators.first().waitFor({ state: "visible" });

  const anchors = await anchorLocators.all();
  const array = [["請求年月", "a", "b", "会社名", "請求項目名", "金額(円)"]];
  for (const a of anchors) {
    const order = await getDetails(a);
    array.push(order);
  }
  return array;
}

/**
 * 詳細情報を取得して
 * [["請求年月", "a", "b", "会社名", "請求項目名", "金額(円)"]] の2次元配列を作成する
 * @param locator
 * @returns
 */
async function getDetails(locator: Locator) {
  const text = await locator.textContent();
  const name = getName(text);

  const context = locator.page().context();
  const pagePromise = context.waitForEvent("page");
  await locator.click({
    button: "left",
    modifiers: ["Control"],
  });
  const page = await pagePromise;
  await sleep(5);

  const billAnchor = page.locator(`div.contents_inner.bill a.btn`, {
    hasText: "請求明細",
  });
  await billAnchor.waitFor({ state: "visible" });
  await billAnchor.click(createClickOption());
  await sleep(5);

  checkUrl(page, "https://web-kensin.jp/payment/list");

  const liLocators = page.locator(`ul.info-list li.info-list_item a`);
  await liLocators.first().waitFor({ state: "visible" });
  const li = liLocators.first();

  const yearMonthOrg = await li
    .locator(`span.info-list_pay_name`)
    .textContent();
  const yenAmount = await li.locator(`span.info-list_pay_yen`).textContent();
  if (!yearMonthOrg || !yenAmount) return [];

  const yearMonth = convertYMtoYYYYMM01(
    yearMonthOrg.replace("＞＞", "").trim()
  );
  const [yen] = yenAmount
    .trim()
    .split("円")
    .map((v) => fixNumber(v));
  // ["請求年月", "a", "b", "会社名", "請求項目名", "金額(円)"]
  const array = [
    yearMonth, // 請求年月
    "", // a
    "", // b
    name, // 会社名
    "東邦液化ガス（株） ガス代", // 請求項目名
    yen, // 金額
  ];
  await page.close();
  return array;
}

function fixNumber(str: string) {
  if (!str) return "";
  return str
    .trim()
    .replace(/,/g, "")
    .replace(/m3$/, "")
    .replace(/\.$/, "")
    .trim();
}

function getName(text: string | null) {
  if (!text) return "";
  const temp = text.split("＞＞")[1].trim(); // 住所 + 施設名 + 種別 に変える
  return temp
    .replace("岐阜県関市武芸川町八幡１５５８－７", "")
    .replace("岐阜県土岐市土岐津町土岐口字中山１３７２", "")
    .trim();
}
