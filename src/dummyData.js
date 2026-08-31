// ============================================================
// ダミーマスタ（参照ボタンの連携デモ用）
//   ・商品マスタ（商品コード / JANコードで検索）
//   ・JICFS（JANコードで検索・商品マスタに無いJAN用）
//   ・商品規格マスタ（商品規格コードで検索）
// 実運用では kintone / EC基盤 / JICFS API から取得する想定。
// ============================================================

// ---- 商品マスタ（商品情報 共通へ流し込む値）----------------
// key = 商品コード。jan で JAN 検索も可能。
export const productMaster = {
  'P0001': {
    productCode: 'P0001',
    janCode: '4901234567894',
    maker: 'メーカーA',
    companyUrl: 'https://example.com/makerA',
    productName: 'オーガニック緑茶 500ml',
    subtitle: '国産茶葉100%',
    catchCopy: 'すっきり飲みやすい定番の緑茶',
    medicineOn: false, medicineType: '対象外',
    alcohol: '対象外', brand: 'ブランドA', series: 'シリーズA', gender: '対象外',
    jicfsCode: '070101', jicfsKanji: '緑茶飲料', jicfsKana: 'リョクチャインリョウ', jicfsAbbr: '緑茶', itfCode: '14901234567891',
    netContent: '500', unit: '本',
    taxType: '軽減税率', tempZone: '常温', dryIce: false,
    allergyMain: [], allergySub: [],
    makerPrice: '150',
    functionalFood: false, specificHealthFood: false,
  },
  'P0002': {
    productCode: 'P0002',
    janCode: '4902345678905',
    maker: 'メーカーB',
    companyUrl: 'https://example.com/makerB',
    productName: 'しっとり保湿クリーム 50g',
    subtitle: '乾燥肌向け',
    catchCopy: '毎日のスキンケアに',
    medicineOn: true, medicineType: '医薬部外品',
    alcohol: '対象外', brand: 'ブランドB', series: 'シリーズB', gender: 'WOMEN',
    jicfsCode: '120305', jicfsKanji: 'スキンクリーム', jicfsKana: 'スキンクリーム', jicfsAbbr: 'クリーム', itfCode: '14902345678902',
    netContent: '50', unit: '個',
    taxType: '基本税率', tempZone: '常温', dryIce: false,
    allergyMain: [], allergySub: [],
    makerPrice: '1200',
    functionalFood: false, specificHealthFood: false,
  },
  'P0003': {
    productCode: 'P0003',
    janCode: '4903456789016',
    maker: 'メーカーC',
    companyUrl: 'https://example.com/makerC',
    productName: '冷凍ミックスベリー 300g',
    subtitle: '4種のベリー',
    catchCopy: '朝食やスムージーに',
    medicineOn: false, medicineType: '対象外',
    alcohol: '対象外', brand: 'ブランドC', series: 'シリーズC', gender: '対象外',
    jicfsCode: '030210', jicfsKanji: '冷凍果実', jicfsKana: 'レイトウカジツ', jicfsAbbr: '冷凍果実', itfCode: '14903456789013',
    netContent: '300', unit: '袋',
    taxType: '軽減税率', tempZone: '冷凍', dryIce: true,
    allergyMain: [], allergySub: ['キウイフルーツ','もも','りんご'],
    makerPrice: '480',
    functionalFood: false, specificHealthFood: false,
  },
}

// JANコード → 商品コード の索引
export const productMasterByJan = Object.fromEntries(
  Object.values(productMaster).map((p) => [p.janCode, p.productCode]),
)

// ---- JICFS（商品マスタに無いJAN用。分類系のみ返す）----------
export const jicfsMaster = {
  '4909999999990': {
    jicfsCode: '070199', jicfsKanji: '清涼飲料水', jicfsKana: 'セイリョウインリョウスイ', jicfsAbbr: '清涼飲料', itfCode: '14909999999997',
    productName: '清涼飲料水（JICFS参照）',
  },
  '4908888888880': {
    jicfsCode: '050110', jicfsKanji: '菓子', jicfsKana: 'カシ', jicfsAbbr: '菓子', itfCode: '14908888888887',
    productName: '菓子類（JICFS参照）',
  },
}

// ---- 商品規格マスタ（商品規格情報 共通へ流し込む値）---------
// key = 商品規格コード。seedSpec で個別明細（基本）へ仮入力する値も保持。
export const specMaster = {
  'SPC0001': {
    common: {
      specCode: 'SPC0001',
      salesRep: '担当A',
      companyCode: 'C001 / 花王株式会社',
      ownItemNo: 'OWN-1001',
      tempZone: '常温', dryIce: false,
      noticeInfo: '告知A',
      deliveryMethod: '通常', deliveryExcludeArea: '沖縄',
      firstShipDate: '2026-09-10', shippingLead: '3日',
      cautionPreset: 'なし', cautionText: '',
      memberOnlyFlag: false, advTicketFlag: false,
      noSearchFlag: false, autoLotteryFlag: false, notifyFlag: true,
    },
    // 商品規格・掲載履歴（個別）の「商品規格（基本）」へ仮入力される値
    seedSpec: {
      specCode: 'SPC0001',
      saleType: '通常',
      choppleType: '仕入（通常）',
      specProductName: 'オーガニック緑茶 500ml 24本ケース',
      applyLimit: '1', applyCount: '2',
      targetChannel: ['web','アプリ'],
      postChannel: ['本店','d店'],
    },
  },
  'SPC0002': {
    common: {
      specCode: 'SPC0002',
      salesRep: '担当B',
      companyCode: 'C003 / △△食品',
      ownItemNo: 'OWN-2002',
      tempZone: '冷凍', dryIce: true,
      noticeInfo: '告知C',
      deliveryMethod: 'クール便', deliveryExcludeArea: '離島',
      firstShipDate: '2026-09-20', shippingLead: '5日',
      cautionPreset: '要冷蔵', cautionText: '解凍後はお早めにお召し上がりください',
      memberOnlyFlag: true, advTicketFlag: false,
      noSearchFlag: false, autoLotteryFlag: true, notifyFlag: true,
    },
    seedSpec: {
      specCode: 'SPC0002',
      saleType: '抽選・発送あり',
      choppleType: '直送MD（通常）',
      specProductName: '冷凍ミックスベリー 300g 抽選セット',
      applyLimit: '1', applyCount: '1',
      targetChannel: ['web'],
      postChannel: ['本店','うま博'],
    },
  },
}

// ---- 発注明細 参照用（商品マスタ→発注明細の項目へ）----------
export function lookupOrderDetailByProduct({ productCode, janCode }) {
  let p = null
  if (productCode && productMaster[productCode]) p = productMaster[productCode]
  else if (janCode && productMasterByJan[janCode]) p = productMaster[productMasterByJan[janCode]]
  if (p) {
    return {
      found: 'master',
      values: {
        productCode: p.productCode,
        janCode: p.janCode,
        jicfsCode: p.jicfsCode,
        jicfsKanji: p.jicfsKanji,
        jicfsKana: p.jicfsKana,
        jicfsShort: p.jicfsAbbr,
        itfCode: p.itfCode,
        productName: p.productName,
        medicineType: p.medicineType,
        alcoholType: p.alcohol,
        tempZone: p.tempZone === 'チルド' ? 'チルド' : p.tempZone,
        dryIce: p.dryIce,
        netContent: p.netContent,
        unit: p.unit,
        makerCode: p.maker === 'メーカーA' ? 'M001' : p.maker === 'メーカーB' ? 'M002' : 'M003',
        makerName: p.maker,
      },
    }
  }
  // JICFSのみ
  if (janCode && jicfsMaster[janCode]) {
    const j = jicfsMaster[janCode]
    return {
      found: 'jicfs',
      values: {
        janCode,
        jicfsCode: j.jicfsCode, jicfsKanji: j.jicfsKanji, jicfsKana: j.jicfsKana,
        jicfsShort: j.jicfsAbbr, itfCode: j.itfCode, productName: j.productName,
      },
    }
  }
  return { found: null, values: {} }
}
