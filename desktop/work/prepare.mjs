// 汉化准备：用 esbuild 正确解析 5 个 catalog 的 default 对象（避免正则误伤），
// 合并出「越南语 key → 英文 value」全量表，切成若干批交给翻译代理。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";

const here = path.dirname(fileURLToPath(import.meta.url));
const catDir = path.join(here, "..", "src", "shared", "i18n", "catalog");
const parts = ["shared", "main", "api", "ui", "updates"];

function loadPart(name) {
  const src = fs.readFileSync(path.join(catDir, name + ".ts"), "utf8");
  const { code } = transformSync(src, { loader: "ts", format: "cjs", target: "node20" });
  const mod = { exports: {} };
  new Function("module", "exports", "require", code)(mod, mod.exports, () => ({}));
  return mod.exports.default ?? mod.exports;
}

const merged = Object.assign(Object.create(null), ...parts.map(loadPart));
const entries = Object.entries(merged);
const all = Object.create(null);
for (const [k, v] of entries) all[k] = v;

fs.mkdirSync(here, { recursive: true });
fs.writeFileSync(path.join(here, "catalog-en.json"), JSON.stringify(all, null, 2), "utf8");

const BATCH = 230;
const bdir = path.join(here, "batches");
fs.mkdirSync(bdir, { recursive: true });
fs.mkdirSync(path.join(here, "out"), { recursive: true });
let n = 0;
for (let s = 0; s < entries.length; s += BATCH) {
  const batch = entries.slice(s, s + BATCH).map(([key, en], j) => ({ i: s + j, key, en }));
  fs.writeFileSync(path.join(bdir, `batch-${String(++n).padStart(2, "0")}.json`), JSON.stringify(batch, null, 2), "utf8");
}

const pluralCount = entries.filter(([, v]) => typeof v === "string" && /\{[^}]*\|[^}]*\|[^}]*\}/.test(v)).length;
const ctxCount = entries.filter(([k]) => k.includes("@@")).length;
console.log("total keys:", entries.length, "| batches:", n, "| plural entries:", pluralCount, "| @@context keys:", ctxCount);
console.log("first 3:", JSON.stringify(entries.slice(0, 3), null, 2));
console.log("a plural sample:", JSON.stringify(entries.find(([, v]) => typeof v === "string" && /\|/.test(v))));
