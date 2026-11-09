import type { Catalog } from "../index";
import api from "./api";
import main from "./main";
import shared from "./shared";
import ui from "./ui";
import updates from "./updates";
import zh from "./zh";

// English for every Vietnamese UI text, split by where the text lives (renderer, main process, shared rules, agent
// API). A key may appear in more than one part only with the same English (checked by test/i18n-catalog.test.ts).
export const CATALOG_PARTS: Record<string, Catalog> = { shared, main, api, ui, updates };
// 简体中文汉化层：zh 只在 CATALOG 里末位覆盖，绝不进 CATALOG_PARTS。
// CATALOG_PARTS 供测试校验「同一 key 各 part 英文一致」，把中文放进去会与其冲突，故刻意只覆盖运行时查表。
// zh 未收录的键自动保留英文（降级），被收录的键显示中文；删除本行 + import 即可完整还原英文版。
export const CATALOG: Catalog = Object.assign(Object.create(null) as Catalog, shared, main, api, ui, updates, zh);
