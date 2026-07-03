import type { ReactNode } from "react";

type AllowedTag = "span" | "strong";

type RichTextTreeNode = {
  children: Array<RichTextTreeNode | ReactNode>;
  className?: string;
  key: number;
  tag: AllowedTag | "root";
};

const TAG_PATTERN =
  /<(\/?)(span|strong|br)(?:\s+(?:class|className)="([^"]*)")?\s*(\/?)>/gi;

function isTreeNode(
  value: RichTextTreeNode | ReactNode,
): value is RichTextTreeNode {
  return typeof value === "object" && value !== null && "tag" in value;
}

function renderTreeNode(node: RichTextTreeNode): ReactNode {
  const children = node.children.map((child) =>
    typeof child === "string" || typeof child === "number"
      ? child
      : isTreeNode(child)
        ? renderTreeNode(child)
        : child,
  );

  if (node.tag === "span") {
    return (
      <span key={node.key} className={node.className}>
        {children}
      </span>
    );
  }

  if (node.tag === "strong") {
    return (
      <strong key={node.key} className={node.className}>
        {children}
      </strong>
    );
  }

  return children;
}

function parseRichText(source: string): ReactNode[] {
  const root: RichTextTreeNode = {
    tag: "root",
    className: undefined,
    key: 0,
    children: [],
  };
  const stack: RichTextTreeNode[] = [root];
  let lastIndex = 0;
  let key = 1;

  for (const match of source.matchAll(TAG_PATTERN)) {
    const [fullMatch, isClosing, tagName, className, isSelfClosing] = match;
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      stack.at(-1)?.children.push(source.slice(lastIndex, matchIndex));
    }

    if (tagName === "br") {
      stack
        .at(-1)
        ?.children.push(<br key={key++} className={className || undefined} />);
      lastIndex = matchIndex + fullMatch.length;
      continue;
    }

    if (!isClosing && !isSelfClosing) {
      stack.push({
        tag: tagName as AllowedTag,
        className: className || undefined,
        key: key++,
        children: [],
      });
      lastIndex = matchIndex + fullMatch.length;
      continue;
    }

    const currentNode = stack.at(-1);
    if (currentNode && currentNode.tag === tagName) {
      stack.pop();
      stack.at(-1)?.children.push(currentNode);
    } else {
      stack.at(-1)?.children.push(fullMatch);
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < source.length) {
    stack.at(-1)?.children.push(source.slice(lastIndex));
  }

  while (stack.length > 1) {
    const currentNode = stack.pop();
    if (!currentNode) {
      break;
    }
    stack.at(-1)?.children.push(currentNode);
  }

  return root.children.map((child) =>
    typeof child === "string" || typeof child === "number"
      ? child
      : isTreeNode(child)
        ? renderTreeNode(child)
        : child,
  );
}

export function RichText({ text }: { text: string }) {
  return <>{parseRichText(text)}</>;
}
