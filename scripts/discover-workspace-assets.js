// asset discovery script for the generation workspace component
(function() {
  const form = document.querySelector('#generation-form');
  if (!form) return JSON.stringify({ error: 'generation-form not found' });
  const container = form.parentElement;
  if (!container) return JSON.stringify({ error: 'container not found' });

  const images = [];
  const videos = [];
  const svgs = [];
  const bgImages = [];

  function walk(el) {
    const tag = el.tagName.toLowerCase();
    if (tag === 'img') {
      images.push({
        src: el.src,
        currentSrc: el.currentSrc,
        alt: el.alt,
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
        width: el.width,
        height: el.height,
        parentTag: el.parentElement?.tagName,
        parentClasses: el.parentElement?.className?.toString().slice(0, 200),
        position: getComputedStyle(el).position,
        zIndex: getComputedStyle(el).zIndex,
        objectFit: getComputedStyle(el).objectFit
      });
    }
    if (tag === 'video') {
      videos.push({
        src: el.src,
        poster: el.poster,
        autoplay: el.autoplay,
        loop: el.loop,
        muted: el.muted,
        width: el.videoWidth,
        height: el.videoHeight
      });
      const sources = [...el.querySelectorAll('source')].map(s => s.src);
      if (sources.length) videos[videos.length - 1].sources = sources;
    }
    if (tag === 'svg') {
      svgs.push({
        classes: el.className?.toString(),
        width: el.getAttribute('width'),
        height: el.getAttribute('height'),
        viewBox: el.getAttribute('viewBox'),
        html: el.outerHTML
      });
    }
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none') {
      bgImages.push({
        url: bg,
        tag: el.tagName,
        classes: el.className?.toString().slice(0, 200)
      });
    }
    [...el.children].forEach(walk);
  }

  walk(container);

  return JSON.stringify({
    images,
    videos,
    svgs,
    bgImages,
    textContent: container.textContent.slice(0, 2000)
  }, null, 2);
})();
