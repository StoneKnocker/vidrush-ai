import { ArrowRightIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "~/components/i18n-link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { cn, formatDate } from "~/lib/utils";
import type { BlogPost } from "~/types/blog";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

const proseClassName = cn(
  "max-w-none text-[#b8b3b0]",
  "[&_a]:font-medium [&_a]:text-[#00d992] [&_a]:underline [&_a]:decoration-[#00d992]/40 [&_a]:underline-offset-4 hover:[&_a]:text-[#2fd6a1]",
  "[&_blockquote]:my-8 [&_blockquote]:border-[#00d992] [&_blockquote]:border-l-4 [&_blockquote]:bg-[#050507] [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-[#b8b3b0] [&_blockquote]:italic",
  "[&_code]:rounded [&_code]:bg-[#050507] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-medium [&_code]:text-[#00d992] [&_code]:text-[0.95em]",
  "[&_h1]:mt-12 [&_h1]:mb-6 [&_h1]:font-semibold [&_h1]:text-4xl [&_h1]:text-[#f2f2f2] [&_h1]:tracking-tight",
  "[&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:font-semibold [&_h2]:text-2xl [&_h2]:text-[#f2f2f2] [&_h2]:tracking-tight",
  "[&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:font-semibold [&_h3]:text-[#f2f2f2] [&_h3]:text-xl",
  "[&_li]:leading-8 [&_ol]:my-6 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-6 [&_p]:my-5 [&_p]:text-[17px] [&_p]:leading-8 [&_ul]:my-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-6",
);

function BlogWorkspaceCta({
  eyebrow = "Avatar workspace",
  title = "Start building your VRChat avatar",
  description = "Open the homepage workspace to generate, preview, texture, rig, save, and download avatar assets in one workflow.",
  action = "Open the workspace",
  to = "/",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: string;
  to?: string;
}) {
  return (
    <aside className="my-10 border-[#00d992]/55 border-y bg-[#050507] px-5 py-6 md:px-7">
      <p className="font-semibold text-[#00d992] text-[11px] uppercase tracking-[0.28em]">
        {eyebrow}
      </p>
      <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="m-0 font-semibold text-2xl text-[#f2f2f2] tracking-tight">
            {title}
          </p>
          <p className="mt-3 mb-0 text-[#b8b3b0] text-base leading-7">
            {description}
          </p>
        </div>
        <Link
          to={to}
          className="!text-[#050507] !no-underline hover:!text-[#050507] inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#00d992] px-4 py-3 font-semibold text-sm transition-colors hover:bg-[#2fd6a1]"
        >
          {action}
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </aside>
  );
}

function BlogLink({ href, children }: { href?: string; children?: ReactNode }) {
  if (href?.startsWith("/")) {
    return <Link to={href}>{children}</Link>;
  }

  return (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

function parseCtaProps(source: string) {
  return Object.fromEntries(
    [...source.matchAll(/(\w+)="([^"]*)"/g)].map(([, key, value]) => [
      key,
      value,
    ]),
  ) as ComponentProps<typeof BlogWorkspaceCta>;
}

function renderBlogContent(content: string) {
  const parts = content.split(/(<BlogWorkspaceCta\b[\s\S]*?\/>)/g);

  return parts.map((part) => {
    const key = `${part.length}-${part.slice(0, 64)}`;

    if (part.startsWith("<BlogWorkspaceCta")) {
      return <BlogWorkspaceCta key={`cta-${key}`} {...parseCtaProps(part)} />;
    }

    if (!part.trim()) {
      return null;
    }

    return (
      <ReactMarkdown
        key={`markdown-${key}`}
        components={{
          a: BlogLink,
        }}
      >
        {part}
      </ReactMarkdown>
    );
  });
}

export function BlogDetail({
  articleEyebrow,
  backToListLabel,
  post,
  blogLabel,
  homeLabel,
}: {
  articleEyebrow: string;
  backToListLabel: string;
  post: BlogPost;
  blogLabel: string;
  homeLabel: string;
}) {
  const authorName = post.authorName || "Editorial Team";
  const publishedAt = post.publishedAt || post.lastModified;

  return (
    <div className="relative overflow-hidden bg-[#050507] pt-28 pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(61,58,57,0.14)_1px,transparent_1px),linear-gradient(180deg,rgba(61,58,57,0.12)_1px,transparent_1px)] bg-[size:80px_80px] opacity-35" />
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(0,217,146,0.12),_transparent_60%)]" />

      <article className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{homeLabel}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/blog">{blogLabel}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{post.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <div>
            <div className="max-w-3xl">
              <h1 className="text-balance font-semibold text-4xl text-[#f2f2f2] tracking-tight md:text-5xl">
                {post.title}
              </h1>
              {post.description ? (
                <p className="mt-6 text-[#b8b3b0] text-lg leading-8">
                  {post.description}
                </p>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 border-[#3d3a39] border-y py-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-11 border border-[#3d3a39]">
                  <AvatarImage src={post.authorAvatar} alt={authorName} />
                  <AvatarFallback className="bg-[#101010] font-semibold text-[#00d992] text-xs uppercase">
                    {getInitials(authorName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-[#f2f2f2]">{authorName}</p>
                  <p className="text-[#8b949e] text-sm">
                    {formatDate(publishedAt, "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            {post.cover ? (
              <div className="mt-8 overflow-hidden rounded-lg border border-[#3d3a39] shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
                <img
                  src={post.cover}
                  alt={post.title}
                  className="aspect-[16/8] w-full object-cover opacity-85"
                />
              </div>
            ) : null}

            <div className="mt-10 rounded-lg border border-[#3d3a39] bg-[#101010] px-6 py-8 shadow-[0_0_15px_rgba(92,88,85,0.16)] md:px-10 md:py-12">
              <div className={proseClassName}>
                {renderBlogContent(post.content)}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-lg border border-[#3d3a39] bg-[#101010] p-6 shadow-[0_0_15px_rgba(92,88,85,0.16)]">
              <p className="font-medium text-[#00d992] text-[11px] uppercase tracking-[0.28em]">
                {articleEyebrow}
              </p>
              <h2 className="mt-4 font-semibold text-[#f2f2f2] text-xl">
                {post.title}
              </h2>
              <p className="mt-4 text-[#b8b3b0] text-[15px] leading-7">
                {post.description}
              </p>
              <Link
                to="/blog"
                className="mt-6 inline-flex font-semibold text-[#00d992] text-sm transition-colors hover:text-[#2fd6a1]"
              >
                {backToListLabel}
              </Link>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
