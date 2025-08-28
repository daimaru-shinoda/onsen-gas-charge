import { load } from "ts-dotenv";
/**
 * 環境設定名
 */
enum JSON_ENV_NAME {
  OTEGARU = "OTEGARU_JSON",
  TOHO = "TOHO_JSON",
  GAS = "GAS_JSON",
  IS_TEST = "IS_TEST",
}

/**
 * 環境変数を読み込む
 */
export const env: { [key in JSON_ENV_NAME]: string } = load({
  OTEGARU_JSON: String,
  TOHO_JSON: String,
  GAS_JSON: String,
  IS_TEST: String,
});

/**
 * おてがるガスnet用設定JSONを読み込む
 */
export function loadJsonOtegaru(): OTEGARU_JSON {
  return loadJson(JSON_ENV_NAME.OTEGARU) as OTEGARU_JSON;
}

/**
 * 東邦ガス用設定JSONを読み込む
 */
export function loadJsonToho(): TOHO_JSON {
  return loadJson(JSON_ENV_NAME.TOHO) as TOHO_JSON;
}

/**
 * yyyy年M月をyyyy-MM-dd形式に変える
 * @param str
 * @returns yyyy-MM-dd
 */
export function convertYMtoYYYYMM01(str: string) {
  if (!str) return "";
  const [y, m] = str.split(/[年月]/);
  const date = new Date(`${y}-${m}-01`);
  const monthStr = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}/${monthStr}/01`;
}

/**
 * GAS設定JSONを読み込む
 */
export function loadJsonGas(): GAS_JSON {
  return loadJson(JSON_ENV_NAME.GAS) as GAS_JSON;
}

/**
 * 環境変数名を指定してJSONを読み込む
 * @param envName 環境変数名
 */
function loadJson(envName: JSON_ENV_NAME): OTEGARU_JSON | GAS_JSON {
  const content = env[envName];
  if (!content) throw new Error(`環境変数が設定されてません ${envName}`);
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("環境変数から取得したjsonのパースに失敗しました。", {
      content,
    });
    throw e;
  }
}

/**
 * テスト中か確認する
 * @returns true: テスト中 / false: 本番
 */
function isTest() {
  return env.IS_TEST === "true";
}
export const IS_TEST = isTest();

/**
 * スリープする
 * @param seconds 秒数
 */
export function sleep(seconds: number) {
  const sec = seconds - 1 + Math.random();
  return new Promise((r) => setTimeout(r, sec * 1000));
}

function pad0(n: number) {
  if (n < 10) return `0${n}`;
  return `${n}`;
}

export function formatDate(date: Date, separator = "-") {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}${separator}${pad0(month)}${separator}${pad0(day)}`;
}

/**
 * 全角数字を半角数字に変える
 * @param text
 * @returns
 */
export function zenkakuToHankaku(text?: string) {
  if (!text) return "";
  const zenkaku = "０１２３４５６７８９";
  const re = new RegExp("[" + zenkaku + "]", "g");
  return text.replace(re, (m) => `${zenkaku.indexOf(m)}`);
}

/**
 * 実行対象日かどうか返す
 * 10日または月末ならtrue
 * その他の日はfalse;
 * @param d
 * @returns
 */
export function isExecDate(d: Date): boolean {
  const date = d.getDate();
  if (date === 10) return true;
  const lastDay = new Date(d.getTime());
  lastDay.setMonth(lastDay.getMonth() + 1, 0);
  const lastDayOfMonth = lastDay.getDate();

  return date === lastDayOfMonth;
}
