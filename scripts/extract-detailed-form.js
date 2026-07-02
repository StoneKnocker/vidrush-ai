// detailed extraction of the generation workspace form per tab state
(function() {
  const form = document.querySelector('#generation-form');
  const container = form?.parentElement;
  if (!form || !container) return JSON.stringify({ error: 'not found' });

  const props = [
    'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
    'textTransform','textDecoration','backgroundColor','background',
    'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
    'margin','marginTop','marginRight','marginBottom','marginLeft',
    'width','height','maxWidth','minWidth','maxHeight','minHeight',
    'display','flexDirection','justifyContent','alignItems','gap',
    'borderRadius','border','borderTop','borderBottom','borderLeft','borderRight',
    'boxShadow','overflow','position','top','right','bottom','left','zIndex',
    'opacity','transform','transition','cursor',
    'objectFit','mixBlendMode','filter','backdropFilter'
  ];

  function styles(el) {
    const cs = getComputedStyle(el);
    const s = {};
    props.forEach(p => {
      const v = cs[p];
      if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') {
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
      text: el.textContent?.trim().slice(0, 200),
      styles: styles(el),
      attrs: {
        placeholder: el.placeholder,
        disabled: el.disabled,
        type: el.type,
        role: el.getAttribute?.('role'),
        ariaLabel: el.getAttribute?.('aria-label')
      }
    };
  }

  function findButtonsByText(text) {
    return [...form.querySelectorAll('button')].filter(b => b.textContent.trim().includes(text));
  }

  function findElementByText(selector, text) {
    return [...form.querySelectorAll(selector)].find(el => el.textContent.trim().includes(text));
  }

  function extractUploadSection(labelText) {
    // Find the section containing this label text
    const allDivs = [...form.querySelectorAll('div')];
    const section = allDivs.find(div => {
      const label = div.querySelector('label, div, span');
      return div.textContent.includes(labelText) && div !== form;
    });
    if (!section) return null;
    return {
      label: labelText,
      element: describe(section),
      text: section.textContent.trim().slice(0, 500)
    };
  }

  // Extract tabs
  const allButtons = [...form.querySelectorAll('button')];
  const tabs = allButtons.filter(b => ['Multi Reference','Image to Video','Text to Video'].includes(b.textContent.trim()));

  // AI model dropdown
  const modelBtn = findElementByText('button', 'Seedance 2.0') || form.querySelector('[role="combobox"]');
  // Find prompt textarea
  const promptArea = [...form.querySelectorAll('textarea')].find(t => t.placeholder?.includes('Type @') || t.placeholder?.includes('prompt') || t.className?.includes('prompt'));
  // Resolution buttons
  const resBtns = allButtons.filter(b => ['480p','720p','1080p','4K'].includes(b.textContent.trim()));
  // Duration buttons
  const durBtns = allButtons.filter(b => ['5s'].includes(b.textContent.trim())) || allButtons.filter(b => b.textContent.trim().match(/^\d+s$/));
  // Aspect ratio buttons
  const arBtns = allButtons.filter(b => ['Auto','16:9','9:16','4:3','3:4','21:9','1:1'].includes(b.textContent.trim()));
  // Generate
  const generateBtn = allButtons.find(b => b.textContent.trim() === 'Generate');
  // Advanced
  const advancedBtn = allButtons.find(b => b.textContent.trim().includes('Advanced'));
  // Return last frame
  const returnLastFrame = allButtons.find(b => b.textContent.trim().includes('Return Last Frame'));
  // Select virtual portrait
  const virtualPortrait = allButtons.find(b => b.textContent.trim().includes('Select Virtual Portrait'));

  // Find upload sections by looking for text patterns
  const uploadSections = [];
  const labels = ['Reference Images', 'Reference Videos', 'Reference Audios', 'Images', 'Add end frame'];
  labels.forEach(lbl => {
    const sections = [...form.querySelectorAll('div')].filter(div => div.textContent.trim().startsWith(lbl) && div.children.length > 0);
    if (sections.length) {
      uploadSections.push({ label: lbl, elements: sections.slice(0, 2).map(describe) });
    }
  });

  // Guide section (in preview area, but only visible in multi-reference)
  const guideSection = container.querySelector('[class*="Guide"]') || [...container.children[1].querySelectorAll('div')].find(div => div.textContent.includes('Multi Reference Guide'));

  // Preview video
  const previewVideo = container.querySelector('video');

  return JSON.stringify({
    currentTab: tabs.find(b => b.classList.contains('bg-primary'))?.textContent?.trim(),
    tabs: tabs.map(describe),
    modelCombobox: describe(modelBtn),
    promptTextarea: describe(promptArea),
    resolutionButtons: resBtns.map(describe),
    durationButtons: durBtns.map(describe),
    aspectRatioButtons: arBtns.map(describe),
    generateButton: describe(generateBtn),
    advancedButton: describe(advancedBtn),
    returnLastFrameButton: describe(returnLastFrame),
    virtualPortraitButton: describe(virtualPortrait),
    uploadSections,
    guideSection: describe(guideSection),
    previewVideo: previewVideo ? {
      src: previewVideo.src,
      poster: previewVideo.poster,
      width: previewVideo.videoWidth,
      height: previewVideo.videoHeight
    } : null,
    formText: form.textContent.trim().slice(0, 3000)
  }, null, 2);
})();
