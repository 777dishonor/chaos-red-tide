import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NotFoundContent } from "@/components/not-found-content";

/**
 * 根级兜底 404：地址完全对不上任何路由时使用，
 * 因此这里自带一套站点框架，避免出现孤零零的空白页。
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col pb-20 md:pb-0">
      <Header />
      <main className="flex-1">
        <NotFoundContent />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
