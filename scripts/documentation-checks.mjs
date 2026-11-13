import assert from 'node:assert/strict';

export async function runDocumentationChecks({ send, evaluate, waitFor, key, route }) {
  await route('button');
  assert.equal(await evaluate(`document.querySelector('.doc-sidebar details').open`), false, 'mobile navigation starts collapsed');
  await evaluate(`document.querySelector('.doc-sidebar summary').focus()`);
  await key('Enter', 'Enter', 13);
  await waitFor(() => evaluate(`document.querySelector('.doc-sidebar details').open`), 'keyboard opens mobile documentation navigation');
  await evaluate(`(() => {
    const input = document.querySelector('[aria-label="Find a component"]');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'zzzz-no-matching-page');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await waitFor(() => evaluate(`!!document.querySelector('.doc-empty') && document.querySelectorAll('nav[aria-label="Component pages"] a').length === 0`), 'empty search filters every navigation group');
  await evaluate(`document.querySelector('[aria-label="Clear component search"]').click()`);
  await waitFor(() => evaluate(`document.querySelectorAll('nav[aria-label="Component pages"] a').length > 27 && document.activeElement.getAttribute('aria-label') === 'Find a component'`), 'clear search restores pages and input focus');
  await evaluate(`document.querySelector('.doc-sidebar a[href="#/docs/quest-brief"]').click()`);
  await waitFor(() => evaluate(`document.querySelector('[data-doc-page="quest-brief"]') && !document.querySelector('.doc-sidebar details').open`), 'choosing a mobile page collapses navigation');

  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await waitFor(() => evaluate(`document.querySelector('.doc-sidebar details').open`), 'desktop navigation expands after resizing');
  await send('DOM.enable');
  await send('CSS.enable');
  for (const theme of ['dark', 'light']) {
    const document = await send('DOM.getDocument');
    const { nodeId } = await send('DOM.querySelector', { nodeId: document.root.nodeId, selector: '.doc-sidebar a[href="#/docs/button"]' });
    const normal = await evaluate(`getComputedStyle(document.querySelector('.doc-sidebar a[href="#/docs/button"]')).color`);
    await send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['hover'] });
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.doc-sidebar a[href="#/docs/button"]')).color`), normal, `${theme} sidebar hover keeps the text color instead of inverting it`);
    await send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });
    await evaluate(`document.querySelector('[aria-label="Toggle appearance"]').click()`);
  }

  await route('button');
  await evaluate(`document.querySelector('.doc-toc a[href$="section=api"]').click()`);
  await waitFor(() => evaluate(`document.querySelector('[data-doc-page="button"]') && document.activeElement.id === 'api' && location.hash.endsWith('?section=api')`), 'section navigation keeps the route and focuses the API reference');
  await send('Page.reload');
  await waitFor(() => evaluate(`document.querySelector('[data-doc-page="button"]') && document.activeElement.id === 'api'`), 'section permalink survives reload');
  assert.equal(await evaluate(`document.querySelector('.doc-sidebar a[aria-current="page"]').getAttribute('href')`), '#/docs/button', 'section navigation keeps the current sidebar page');
  await evaluate(`document.querySelector('.doc-pagination a:last-child').click()`);
  await waitFor(() => evaluate(`!!document.querySelector('[data-doc-page="card"]')`), 'next-page navigation follows the component index');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await route('introduction');
  console.log('Documentation passed: mobile navigation, complete search/clear, stable hover in both themes, section permalinks/focus/reload and previous/next navigation.');
}
