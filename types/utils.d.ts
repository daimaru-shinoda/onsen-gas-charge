/**
 * おてがるガスnet用設定
 */
type OTEGARU_JSON = {
  id: string;
  password: string;
};

/**
 * 東邦用設定
 */
type TOHO_JSON = {
  id: string;
  password: string;
};

type GAS_JSON = {
  url: string;
  apiKey: string;
};

/**
 * 土地仕入稟議ー社内提出から取得したデータ
 */
type TargetData = {
  bukkenmei: string; // 物件名
  shozaichi: string; // 物件所在地
  shinseibi: string; // 申請日
  keiyakubi: string; // 契約日
  hikiwatasiYoteibi: string; // 引渡予定日
  postCode: string; // 郵便番号
  prefecture: string; // 都道府県
  latlng: string; // 座標(経度,緯度)
  soukukakusuu: number; // 総区画数
};

/**
 * 案件作成用データ
 */
type AnkenData = TargetData & {
  projectId: string; // プロジェクトID
};

/**
 * 物件進捗一覧へ反映するためのデータ
 */
type PostData = {
  システムID: string;
  親土地番号: string;
  本契約番号: string;
  問合番号: string;
  案件名: string;
};
