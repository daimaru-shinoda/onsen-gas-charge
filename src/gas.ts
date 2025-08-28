import { IS_TEST, loadJsonGas } from "./utils";

/**
 * 使用量データを送信する
 * @param array
 * @returns
 */
export async function postChargeInfo(csv: string[][]) {
  if (IS_TEST) return console.log("postChargeInfo exit because testing", csv);
  const { url, apiKey } = loadJsonGas();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: csv,
      apiKey,
    }),
  });
  const text = await res.text();
  console.log(text);
}
