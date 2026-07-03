import type { Resource } from "i18next";
import { replaceAppNamePlaceholders } from "~/lib/content-placeholder";
import { DEFAULT_APP_NAME } from "~/lib/public-env.shared";

// 自动加载所有翻译文件
const translationFiles = import.meta.glob("./json/**/*.json", { eager: true });
const appName = DEFAULT_APP_NAME;

/**
 * 从文件路径中提取语言和命名空间
 * 路径格式: ./json/{lang}/{namespace}.json
 */
function extractLocaleInfo(
  filePath: string,
): { lang: string; namespace: string } | null {
  const regex = /^\.\/json\/([^/]+)\/([^/]+)\.json$/;
  const match = filePath.match(regex);

  if (!match) {
    return null;
  }

  const lang = match[1];
  const namespace = match[2];

  // 确保捕获的组不为空
  if (!lang || !namespace) {
    return null;
  }

  return { lang, namespace };
}

// 构建resources对象
const resources: Resource = {};

for (const [filePath, module] of Object.entries(translationFiles)) {
  const localeInfo = extractLocaleInfo(filePath);

  if (!localeInfo) {
    continue;
  }

  const { lang, namespace } = localeInfo;

  // 确保语言对象存在
  if (!resources[lang]) {
    resources[lang] = {};
  }

  const langResources = resources[lang];

  // 添加命名空间翻译
  if (langResources) {
    langResources[namespace] = replaceAppNamePlaceholders(
      (module as { default: Record<string, string> }).default,
      appName,
    );
  }
}

export default resources;
