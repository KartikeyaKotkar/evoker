import assert from 'node:assert/strict';

// Reuse the browser smoke session so responsive checks run in CI without another server.
export async function runResponsiveChecks({ send, evaluate, waitFor, key }) {
  const settle = () => evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  const resize = async (width, height) => {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await settle();
  };
  const route = async (id) => {
    await evaluate(`location.hash = ${JSON.stringify(id ? '#/docs/' + id : '')}`);
    await waitFor(() => evaluate(id
      ? `document.querySelector('[data-doc-page]')?.dataset.docPage === ${JSON.stringify(id)}`
      : `!!document.querySelector('.catalog')`), `responsive route ${id || 'playground'}`);
    await settle();
  };
  const check = async (label) => {
    const problems = await evaluate(`(() => {
      const problems = [];
      const width = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth > width + 1) problems.push('page horizontal overflow');
      for (const element of document.querySelectorAll('body *')) {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if (!rect.width || style.position === 'absolute' || style.position === 'fixed') continue;
        // These regions intentionally scroll locally or contain decorative geometry.
        if (element.closest('[hidden], [inert], .water, .evoker-selection, .doc-code, .evoker-code-content, .doc-table-scroll, .component-index, .doc-sidebar nav')) continue;
        if (rect.left < -1 || rect.right > width + 1) problems.push(element.tagName + '.' + element.className);
      }
      const title = document.querySelector('.hero h1');
      const menu = document.querySelector('.hero-menu');
      if (title && menu) {
        const bounds = menu.getBoundingClientRect();
        const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
        let node;
        while (node = walker.nextNode()) {
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) {
            if (rect.right > bounds.left + 1 && rect.left < bounds.right - 1 && rect.bottom > bounds.top + 1 && rect.top < bounds.bottom - 1) problems.push('hero text overlaps menu');
          }
        }
        if (document.querySelector('.hero-caption').getBoundingClientRect().top < bounds.bottom - 1) problems.push('caption overlaps menu');
      }
      const sidebar = document.querySelector('.doc-sidebar');
      if (sidebar && getComputedStyle(sidebar).position === 'sticky') {
        const header = document.querySelector('.doc-header').getBoundingClientRect();
        if (Math.abs(parseFloat(getComputedStyle(sidebar).top) - header.height) > 1) problems.push('sidebar offset differs from header height');
      }
      return problems.slice(0, 8);
    })()`);

    assert.deepEqual(problems, [], label);
  };
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await route('introduction');
  const pages = await evaluate(`[...new Set([...document.querySelectorAll('.doc-sidebar a')].map(link => link.hash.split('/').pop()))]`);
  const sizes = [[240, 640], [280, 653], [320, 568], [390, 844], [480, 320], [600, 960], [768, 1024], [820, 1180], [960, 600], [1024, 768], [1280, 720], [1440, 900], [1920, 1080], [2560, 1440], [3440, 1440], [3840, 2160], [7680, 4320]];
  for (const id of ['', 'introduction', 'inspector-list', 'setting-row', 'date-badge', 'party-panel', 'status-dialog']) {
    await route(id);
    for (const [width, height] of sizes) {
      await resize(width, height);
      await check(`${id || 'playground'} at ${width}×${height}`);
    }
  }
  for (const fontSize of ['100%', '200%']) {
    await evaluate(`document.documentElement.style.fontSize = '${fontSize}'`);
    await resize(320, 568);
    for (const id of pages) {
      await route(id);
      await check(`${id} at 320px with ${fontSize} text`);
    }
    for (const width of [240, 768, 1024, 1440]) {
      await resize(width, 800);
      await route('');
      await check(`playground at ${width}px with ${fontSize} text`);
    }
  }
  // Portalled overlays must remain reachable on narrow and short screens, too.
  for (const [width, height] of [[240, 320], [820, 320]]) {
    await resize(width, height);
    for (const [id, trigger, popup] of [
      ['dialog', '.doc-preview button', '[role="dialog"]'],
      ['status-dialog', '.doc-preview button', '.evoker-status-dialog'],
      ['select', '.doc-preview [role="combobox"]', '.evoker-select-content'],
      ['dropdown-menu', '.doc-preview button', '.evoker-menu-content'],
    ]) {
      await route(id);
      await evaluate(`document.querySelector(${JSON.stringify(trigger)}).scrollIntoView({ block: 'center', behavior: 'instant' })`);
      await settle();
      await evaluate(`(() => { const trigger = document.querySelector(${JSON.stringify(trigger)}); trigger.focus({ preventScroll: true }); })()`);
      await key('Enter', 'Enter', 13);
      await waitFor(() => evaluate(`!!document.querySelector(${JSON.stringify(popup)})`), `${id} popup`);
      await waitFor(() => evaluate(`!document.querySelector(${JSON.stringify(popup)})?.hasAttribute('data-starting-style')`), `${id} entrance completes`);
      await settle();
      assert.equal(await evaluate(`(() => {
        const rect = document.querySelector(${JSON.stringify(popup)}).getBoundingClientRect();
        return rect.left >= -1 && rect.right <= innerWidth + 1 && rect.top >= -1 && rect.bottom <= innerHeight + 1;
      })()`), true, `${id} popup fits ${width}×${height} with 200% text`);
      if (id === 'status-dialog') {
        assert.equal(await evaluate(`(() => {
          const heading = document.querySelector('.evoker-status-dialog .evoker-modal-heading');
          const bounds = heading.getBoundingClientRect();
          const close = heading.querySelector('button').getBoundingClientRect();
          const title = heading.querySelector('.evoker-modal-title').getBoundingClientRect();
          return Math.abs(close.top - bounds.top) <= 1 && Math.abs(close.right - bounds.right) <= 1 && title.right <= close.left;
        })()`), true, `status close stays at the top right without overlapping the title at ${width}×${height}`);
      }
      await route('introduction');
    }
  }
  await evaluate(`document.documentElement.style.removeProperty('font-size')`);
  await send('Emulation.setEmulatedMedia', { features: [] });
  await resize(1440, 1100);
  await route('');
  console.log('Responsive checks passed: 240–7680px, short landscape, every documentation page at 320px, 200% text, portalled overlays.');
}
