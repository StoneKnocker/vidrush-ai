import {
  index,
  layout,
  prefix,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  // a  big bug: 路由的第一段不能是2位长度的字符串，否则会被误认为是 locale 前缀
  ...prefix("/:locale?", [
    layout("routes/locale-layout.tsx", [
      layout("routes/header-footer-layout.tsx", [
        index("routes/index.tsx"),
        route("payment/success", "routes/pages/payment/success.tsx"),
        route("pricing", "routes/pages/pricing.tsx"),
        route("blog", "routes/pages/blog.tsx"),
        route("blog/:slug", "routes/pages/blog-post.tsx"),
        route("playground", "routes/pages/playground.tsx"),
        route("cyberrealistic-pony", "routes/pages/cyberrealistic-pony.tsx"),
        route("feedback", "routes/pages/feedback.tsx"),
        route("_test", "routes/_test.tsx"),
        ...prefix("user", [
          layout("routes/pages/user/layout.tsx", [
            route("creations", "routes/pages/user/creations.tsx"),
            route("credits", "routes/pages/user/credits.tsx"),
          ]),
        ]),
      ]),
      route("privacy-policy", "routes/pages/privacy-policy.tsx"),
      route("cookie-policy", "routes/pages/cookie-policy.tsx"),
      route("terms-and-conditions", "routes/pages/terms-and-conditions.tsx"),
      route("signin", "routes/pages/signin.tsx"),
    ]),
  ]),

  // Auth routes (no locale)
  route("auth/popup", "routes/auth/popup.tsx"),
  route("auth/callback", "routes/auth/callback.tsx"),

  // admin pages
  route("admin/creations", "routes/pages/admin/creations.tsx"),

  // sitemap
  route("sitemap.xml", "routes/sitemap.ts"),

  ...prefix("api", [
    route("auth/error", "routes/api/better-error.tsx"),
    route("auth/*", "routes/api/better.tsx"),
    route("color-scheme", "routes/api/color-scheme.ts"),
    route("locales/:lng/:ns", "routes/api/locales.ts"),
    route("trpc/*", "routes/api/trpc.ts"),
    route("payment/webhook/creem", "routes/api/payment/webhook/creem.ts"),
  ]),

  // Not found
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
