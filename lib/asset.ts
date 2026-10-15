/**
 * 站点可能被部署在子路径下（例如 GitHub Pages 的 https://<user>.github.io/<repo>/）。
 * 构建时通过 NEXT_PUBLIC_BASE_PATH 注入前缀，本地开发时为空字符串。
 *
 * 注意：<Link> 会自动带上前缀，但裸 <img src="/...">、manifest 里的路径、
 * 以及 Markdown 正文渲染出的 <img> 都不会，凡是 public/ 下的静态资源
 * 都必须经过这里拼前缀，否则部署到子路径后一律 404。
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetUrl(pathname: string): string {
  if (!pathname || !pathname.startsWith("/")) return pathname;
  if (pathname.startsWith("//")) return pathname; // 协议相对外链，不动
  return `${BASE_PATH}${pathname}`;
}
