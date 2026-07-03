// focused style extraction for key workspace elements
(() => {
  const form = document.querySelector("#generation-form");
  const container = form?.parentElement;
  if (!form || !container) return JSON.stringify({ error: "not found" });

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
    "borderRadius",
    "border",
    "borderTop",
    "borderBottom",
    "borderLeft",
    "borderRight",
    "boxShadow",
    "overflow",
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
    "mixBlendMode",
    "filter",
    "backdropFilter",
  ];

  function styles(el) {
    const cs = getComputedStyle(el);
    const s = {};
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
        s[p] = v;
      }
    });
    return s;
  }

  function describe(el) {
    if (!el) return null;
    return {
      tag: el.tagName?.toLowerCase(),
      class: el.className?.toString(),
      id: el.id || undefined,
      text: el.textContent?.trim().slice(0, 100),
      styles: styles(el),
    };
  }

  // find key elements
  const tabs = [...form.querySelectorAll("button")].filter((b) =>
    ["Multi Reference", "Image to Video", "Text to Video"].includes(
      b.textContent.trim(),
    ),
  );
  const activeTab =
    tabs.find((b) => b.classList.contains("bg-primary")) || tabs[0];
  const inactiveTab =
    tabs.find((b) => !b.classList.contains("bg-primary")) || tabs[1];
  const uploadAreas = [
    ...form.querySelectorAll('[class*="Click to upload"], [class*="upload"]'),
  ].slice(0, 5);
  const buttons = [...form.querySelectorAll("button")];
  const generateBtn = buttons.find((b) =>
    b.textContent.trim().includes("Generate"),
  );
  const advancedBtn = buttons.find((b) =>
    b.textContent.trim().includes("Advanced"),
  );
  const textInputs = [...form.querySelectorAll('textarea, input[type="text"]')];
  const promptTextarea = textInputs.find(
    (el) =>
      el.placeholder?.includes("prompt") || el.placeholder?.includes("Type @"),
  );
  const modelCombobox =
    form.querySelector('[role="combobox"]') ||
    form
      .querySelector("button")
      ?.parentElement?.querySelector('[role="combobox"]');
  const previewArea = container.children[1];

  return JSON.stringify(
    {
      activeTab: describe(activeTab),
      inactiveTab: describe(inactiveTab),
      generateBtn: describe(generateBtn),
      advancedBtn: describe(advancedBtn),
      promptTextarea: describe(promptTextarea),
      modelCombobox: describe(modelCombobox),
      previewArea: describe(previewArea),
      form: describe(form),
      container: describe(container),
    },
    null,
    2,
  );
})();
