// extract all tab button styles
(() => {
  const tabs = [...document.querySelectorAll("button")].filter((b) =>
    ["Multi Reference", "Image to Video", "Text to Video"].includes(
      b.textContent.trim(),
    ),
  );
  const props = [
    "fontSize",
    "fontWeight",
    "lineHeight",
    "color",
    "backgroundColor",
    "padding",
    "borderRadius",
    "boxShadow",
    "opacity",
    "transition",
    "cursor",
  ];
  return JSON.stringify(
    tabs.map((t) => {
      const cs = getComputedStyle(t);
      const s = {};
      props.forEach((p) => (s[p] = cs[p]));
      return {
        text: t.textContent.trim(),
        class: t.className,
        isActive: t.classList.contains("bg-primary"),
        styles: s,
      };
    }),
    null,
    2,
  );
})();
