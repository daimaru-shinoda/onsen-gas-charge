import { Page } from "playwright-core";
import { checkUrl, createClickOption, fill } from "./playwright-common";
import { sleep, loadJsonToho, convertYMtoYYYYMM01 } from "./utils";
import { postChargeInfo } from "./gas";

const LOGIN_URL = "https://biznex.tohogas.co.jp/login";

/**
 * 東邦ガスから使用量データを取得する
 * @param page
 */
export async function loadTohoBiz(page: Page) {
  console.log("loadTohoBiz start");
  try {
    await login(page);
    const csv = await moveToTargetPage(page);
    console.log(csv.map((v) => v.join(",")).join("\n"));
    postChargeInfo(csv);
  } finally {
    if (page.url().startsWith("https://biznex.tohogas.co.jp/")) {
      await logout(page);
    }
    await sleep(30);
  }
}

/**
 * ログインする
 * @param page
 */
async function login(page: Page) {
  console.log("login start");
  await page.goto(LOGIN_URL);
  await sleep(1);

  const json = loadJsonToho();

  console.debug("login page opened");

  await page.locator("input#username").waitFor({ state: "visible" });

  // id入力
  await fill(page, "input#username", json.id);
  // パスワードを入力
  await fill(page, "input#inputPassword", json.password);
  await sleep(2);

  // ログインボタンクリック
  const submitLocator = page.locator(
    `button.btn.btn-sm.btn-submit-common.btn-loginUser`,
    {
      hasText: "ログイン",
    }
  );
  await submitLocator.waitFor({ state: "visible" });
  await submitLocator.click();
  await page.waitForEvent("load");

  await sleep(5);

  console.log("url: ", page.url());

  if (!page.url().startsWith("https://biznex.tohogas.co.jp/")) {
    await login(page);
  }
  await sleep(0.5);
  console.log("login done");
}

/**
 * ログアウトする
 * @param page
 */
async function logout(page: Page) {
  const logoutLocator = page
    .locator(`a#tohogasLogout.nav-link`, {
      hasText: "ログアウト",
    })
    .first();
  await logoutLocator.waitFor({ state: "visible" });
  await logoutLocator.click(createClickOption());
  await sleep(3);
  console.log("logout done");
}

/**
 * 目的のページへ移動する
 * @param page
 */
async function moveToTargetPage(page: Page) {
  const anchorLocator = page
    .locator(`ul.menu li a`)
    .getByText("マイページ", { exact: true });

  await anchorLocator.waitFor({ state: "visible" });
  await anchorLocator.click(createClickOption());
  await sleep(2);

  checkUrl(page, "https://biznex.tohogas.co.jp/home/member/viewprofile");

  const listLocator = page.locator(`a.menu-item button.btn.btn-sm`, {
    hasText: "請求書ダウンロード",
  });
  await listLocator.first().waitFor({ state: "visible" });
  await listLocator.first().click(createClickOption());
  await sleep(10);

  // 請求書の番号と施設名の対応表
  const numberTable: { [num: string]: string } = {
    "20-6772-9361": "ぎなん温泉",
    "20-6560-7841": "ぬくい温泉",
  };

  const trLocators = page.locator(
    `table.table-data.web-request-table tbody tr`
  );
  await trLocators.waitFor({ state: "visible" });

  const ym = await page
    .locator(`div.calendar select.select-css option:checked`)
    .textContent();
  const yearMonth = convertYMtoYYYYMM01(!!ym ? ym.trim() : "");
  const trs = await trLocators.all();
  const array = [["請求年月", "a", "b", "会社名", "請求項目名", "金額(円)"]];
  for (const tr of trs) {
    const tds = await tr.locator("td").all();
    const data = await Promise.all(tds.map((td) => td.textContent()));
    const [, claimNumber, , yen, tax] = data.map((v) => (!!v ? v.trim() : ""));
    console.log("moveToTargetPage", [claimNumber, yen, tax]);
    const shisetsu = numberTable[claimNumber];
    const zeinukiKingaku = fixNumber(yen) - fixNumber(tax);
    array.push([
      yearMonth, // 請求年月
      "", // a
      "", // b
      shisetsu, // 使用施設名
      "東邦ガス ガス代", // 請求項目名
      `${zeinukiKingaku}`, // 金額
    ]);
  }

  console.log(JSON.stringify(array));
  return array;
}

function fixNumber(str: string) {
  str = str.trim().replace(/,/g, "").replace(/^¥/, "").trim();
  return parseInt(str, 10);
}
