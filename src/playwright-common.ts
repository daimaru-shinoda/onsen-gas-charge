import { Locator, Page } from "playwright-core";
import { sleep } from "./utils";

/**
 * playwright: 入力時のオプションを作成する
 */
export function createFillOption() {
  return {
    timeout: 1000,
  };
}

/**
 * playwright: クリック時のオプションを作成する
 */
export function createClickOption(): {
  button: "left";
  delay: number;
  position: { x: number; y: number };
  clickCount: number;
} {
  return {
    button: "left",
    delay: 500 * Math.random() + 10,
    clickCount: 1,
    position: { x: 2 * Math.random() + 1, y: 2 * Math.random() + 1 },
  };
}

/**
 * 要素をクリックする
 * クリック時にエラーが発生した場合は、エラーを無視する
 * @param locator
 * @param sleepTime 待ち時間(秒) 基本は1秒
 */
export async function tryClick(locator: Locator, sleepTime = 1) {
  const count = await locator.count();
  if (count > 1) throw new Error("Locator has multiple instances");
  if (count < 1) throw new Error("Locator not found");
  if ((await locator.isHidden()) || (await locator.isDisabled())) {
    throw new Error("Locator is hidden or disabled");
  }
  try {
    await sleep(0.5);
    await locator.click(createClickOption());
    await sleep(sleepTime);
  } catch (e) {
    console.error("tryClick error", e);
  }
}

/**
 * スクロールして要素を表示させる
 * @param page
 * @param target
 */
export async function scrollToBottom(page: Page, target: Locator) {
  await target.waitFor({ state: "visible" });
  await sleep(1);
  const box = await target.boundingBox();
  if (!box) throw new Error("box is null");
  // ページをスクロールする
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  for (let i = 0; i < 10; i++) {
    console.log("scrollToBottom", i);
    await page.mouse.wheel(0, 1000);
    await sleep(0.5);
  }
}

/**
 * urlに遷移する
 * 遷移後5秒待機する
 * @param page
 * @param url
 */
export async function goto(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle" });
  await sleep(5);
}

/**
 * page内の指定されたセレクタに値を入力する
 * @param page
 * @param selector
 * @param value
 */
export async function fill(page: Page, selector: string, value: string) {
  const locator = page.locator(selector);
  await locator.fill(value, createFillOption());
  locator.blur();
  await sleep(0.5);
}

/**
 * selectタグの値をラベルで指定する
 * @param page
 * @param selector
 * @param label
 */
export async function selectDropdown(
  page: Page,
  selector: string,
  label: string
) {
  await page.selectOption(selector, { label });
  await sleep(0.5);
  await page.evaluate((_selector) => {
    const select = document.querySelector(_selector) as HTMLSelectElement;
    select.blur();
  }, selector);
  await sleep(0.5);
}

export function checkUrl(page: Page, url: string) {
  if (page.url() !== url) {
    throw new Error(`dont move to ${url}`);
  }
}
