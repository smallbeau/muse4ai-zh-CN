// 合并并校验中文译文 → 生成 src/shared/i18n/catalog/zh.ts
// 校验规则与 test/i18n-catalog.test.ts 完全一致：占位符集合必须和越南语 key 一致、
// 不能引入新占位符、不能丢失占位符、不能残留越南语带调字母。
// 任何一条不合规就跳过该键，运行时自动回退英文（因为 zh 是最后覆盖的一层）。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const zhPath = path.join(root, "src", "shared", "i18n", "catalog", "zh.ts");

const en = JSON.parse(fs.readFileSync(path.join(here, "catalog-en.json"), "utf8"));
const keys = Object.keys(en);

const PH = /\{(\w+)\}/g;
const PLURAL = /\{(\w+)\|[^|{}]*\|[^|{}]*\}/g;
const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
const names = (s, re) => new Set([...s.matchAll(re)].map((m) => m[1]));

function loadOut(file) {
  let raw = fs.readFileSync(file, "utf8").trim();
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const data = JSON.parse(raw);
  if (Array.isArray(data)) return data;
  return Object.entries(data).map(([i, v]) => (typeof v === "string" ? { i: Number(i), zh: v } : { i: Number(i), ...v }));
}

const byIndex = new Map();
const fileReports = [];
const outDir = path.join(here, "out");
const files = fs.existsSync(outDir)
  ? fs.readdirSync(outDir).filter((f) => /^batch-\d+\.json$/i.test(f)).sort()
  : [];
for (const f of files) {
  try {
    const arr = loadOut(path.join(outDir, f));
    let n = 0;
    for (const row of arr) {
      if (!row || typeof row !== "object") continue;
      const i = Number(row.i);
      const zh = row.zh ?? row.zh_CN ?? row.cn ?? row.value;
      if (!Number.isInteger(i) || i < 0 || i >= keys.length) continue;
      if (typeof zh !== "string" || !zh.trim()) continue;
      if (!byIndex.has(i)) {
        byIndex.set(i, zh);
        n++;
      }
    }
    fileReports.push(`${f}: ${arr.length} rows, ${n} accepted`);
  } catch (e) {
    fileReports.push(`${f}: FAILED ${e.message}`);
  }
}

// 少数条目英文原文本身就是缩写/纯占位符，译文无汉字会被下面的 CJK 校验拦下。
// 这里手工补齐确实应当中文化的短词（纯占位符条目英文与中文相同，回退英文即可，无需列出）。
const OVERRIDES = { 40: "界面", 1713: "Agent API 接口" };

const rejected = [];
const accepted = Object.create(null);
for (let i = 0; i < keys.length; i++) {
  const key = keys[i];
  const zh = OVERRIDES[i] ?? byIndex.get(i);
  if (zh === undefined) {
    rejected.push({ i, why: "missing" });
    continue;
  }
  const why = [];
  const k = names(key, PH);
  const plain = names(zh.replace(PLURAL, ""), PH);
  const plurals = names(zh, PLURAL);
  for (const n of [...plain, ...plurals]) if (!k.has(n)) why.push(`unknown {${n}}`);
  for (const n of k) if (!plain.has(n)) why.push(`drops {${n}}`);
  if (VI.test(zh)) why.push("Vietnamese diacritics");
  if (zh.includes("|")) why.push("contains |");
  if (!/[\u3400-\u9fff]/.test(zh)) why.push("no CJK (likely untranslated)");
  if (why.length) {
    rejected.push({ i, key, zh, why });
    continue;
  }
  accepted[key] = zh;
}

const esc = (s) => JSON.stringify(s).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
const lines = [
  'import type { Catalog } from "../index";',
  "",
  "// 简体中文译文层（本地汉化，非官方）。键为越南语源文本，与英文 catalog 一致。",
  "// 由 work/merge.mjs 生成：未通过校验的条目不写入，运行时自动回退英文。",
  "const zh: Catalog = {",
  ...Object.entries(accepted).map(([k, v]) => `  ${esc(k)}: ${esc(v)},`),
  "};",
  "",
  "export default zh;",
  "",
];
fs.writeFileSync(zhPath, lines.join("\n"), "utf8");

const nAccepted = Object.keys(accepted).length;
const report = {
  totalKeys: keys.length,
  accepted: nAccepted,
  fallbackToEnglish: rejected.length,
  coverage: `${((nAccepted / keys.length) * 100).toFixed(1)}%`,
  files: fileReports,
  rejected: rejected,
};
fs.writeFileSync(path.join(here, "merge-report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify({ totalKeys: report.totalKeys, accepted: report.accepted, fallbackToEnglish: report.fallbackToEnglish, coverage: report.coverage, files: report.files }, null, 2));
console.log("rejected sample:", JSON.stringify(rejected.slice(0, 12), null, 2));
