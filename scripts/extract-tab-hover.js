// hover state extraction for inactive tab
(() => {
  const tab = [...document.querySelectorAll("button")].find(
    (b) => b.textContent.trim() === "Multi Reference",
  );
  if (!tab) return JSON.stringify({ error: "tab not found" });
  const cs = getComputedStyle(tab);
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
  const s = {};
  props.forEach((p) => (s[p] = cs[p]));
  return JSON.stringify(
    {
      text: tab.textContent.trim(),
      class: tab.className,
      styles: s,
    },
    null,
    2,
  );
})();
