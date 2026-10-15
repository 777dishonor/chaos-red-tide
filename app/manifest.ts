import type { MetadataRoute } from "next";

import { assetUrl } from "@/lib/asset";

/**
 * 网页应用清单：让「添加到主屏幕」后带正确的名称、配色与图标，
 * 打开时以独立窗口呈现（不显示浏览器地址栏）。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "混沌赤潮 · 文存",
    short_name: "混沌赤潮",
    description: "西方仪式魔法的实操记录与文献译介。",
    lang: "zh-CN",
    start_url: assetUrl("/"),
    display: "standalone",
    background_color: "#0D0D0F",
    theme_color: "#0D0D0F",
    icons: [
      {
        src: assetUrl("/icon.svg"),
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
