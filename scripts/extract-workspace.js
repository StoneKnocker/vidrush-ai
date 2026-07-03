// extraction script for the generation workspace component
(() => {
  const form = document.querySelector("#generation-form");
  if (!form) return JSON.stringify({ error: "generation-form not found" });
  const container = form.parentElement;
  if (!container) return JSON.stringify({ error: "container not found" });

  const props = [
    "fontSize",
    "fontWeight",
    "fontFamily",
    "lineHeight",
    "letterSpacing",
    "color",
    "textTransform",
    "textDecoration",
    "backgroundColor",
    "background",
    "padding",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "margin",
    "marginTop",
    "marginRight",
    "marginBottom",
    "marginLeft",
    "width",
    "height",
    "maxWidth",
    "minWidth",
    "maxHeight",
    "minHeight",
    "display",
    "flexDirection",
    "justifyContent",
    "alignItems",
    "gap",
    "gridTemplateColumns",
    "gridTemplateRows",
    "borderRadius",
    "border",
    "borderTop",
    "borderBottom",
    "borderLeft",
    "borderRight",
    "boxShadow",
    "overflow",
    "overflowX",
    "overflowY",
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "zIndex",
    "opacity",
    "transform",
    "transition",
    "cursor",
    "objectFit",
    "objectPosition",
    "mixBlendMode",
    "filter",
    "backdropFilter",
    "whiteSpace",
    "textOverflow",
    "WebkitLineClamp",
  ];

  function extractStyles(element) {
    const cs = getComputedStyle(element);
    const styles = {};
    props.forEach((p) => {
      const v = cs[p];
      if (
        v &&
        v !== "none" &&
        v !== "normal" &&
        v !== "auto" &&
        v !== "0px" &&
        v !== "rgba(0, 0, 0, 0)"
      ) {
        styles[p] = v;
      }
    });
    return styles;
  }

  function walk(element, depth) {
    if (depth > 5) return null;
    const children = [...element.children];
    const tag = element.tagName.toLowerCase();
    const node = {
      tag: tag,
      classes: element.className?.toString().split(" ").slice(0, 8).join(" "),
      id: element.id || undefined,
      text:
        element.childNodes.length === 1 && element.childNodes[0].nodeType === 3
          ? element.textContent.trim().slice(0, 300)
          : null,
      styles: extractStyles(element),
      childCount: children.length,
      children: children
        .slice(0, 30)
        .map((c) => walk(c, depth + 1))
        .filter(Boolean),
    };
    if (tag === "img") {
      node.src = element.src;
      node.alt = element.alt;
      node.naturalWidth = element.naturalWidth;
      node.naturalHeight = element.naturalHeight;
      node.currentSrc = element.currentSrc;
    }
    if (tag === "video") {
      node.src = element.src;
      node.poster = element.poster;
      node.autoplay = element.autoplay;
      node.loop = element.loop;
      node.muted = element.muted;
    }
    if (tag === "svg") {
      node.svgHtml = element.outerHTML.slice(0, 500);
    }
    return node;
  }

  return JSON.stringify(
    {
      container: walk(container, 0),
      form: walk(form, 0),
      preview: walk(container.children[1], 0),
    },
    null,
    2,
  );
})();
