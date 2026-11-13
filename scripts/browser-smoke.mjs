import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { runResponsiveChecks } from './responsive-checks.mjs';

// Uses an installed Chromium browser and the native DevTools protocol; no test runtime dependency.
const executable = process.env.CHROME_PATH ?? ['/opt/google/chrome/chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync);
if (!executable) throw new Error('Set CHROME_PATH to an installed Chromium executable.');
const root = resolve(import.meta.dirname, '..');
const profile = mkdtempSync(resolve(tmpdir(), 'evoker-browser-'));
const server = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '5174', '--strictPort'], { cwd: resolve(root, 'playground'), stdio: ['ignore', 'pipe', 'pipe'] });
const browser = spawn(executable, ['--headless', '--no-sandbox', '--disable-dev-shm-usage', '--no-first-run', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
let serverLog = '';
let browserLog = '';
server.stdout.on('data', (data) => { serverLog += data; });
server.stderr.on('data', (data) => { serverLog += data; });
browser.stderr.on('data', (data) => { browserLog += data; });
server.on('error', (error) => { serverLog += error.message; });
browser.on('error', (error) => { browserLog += error.message; });
async function waitFor(check, label, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await check()) return;
    await delay(50);
  }
  throw new Error(`Timed out: ${label}`);
}
try {
  await waitFor(async () => {
    if (server.exitCode !== null) throw new Error(`Vite exited before startup: ${serverLog}`);
    try {
      return (await fetch('http://127.0.0.1:5174/', { signal: AbortSignal.timeout(1000) })).ok;
    } catch { return false; }
  }, 'Vite startup');
  let endpoint;
  await waitFor(() => {
    if (browser.exitCode !== null) throw new Error(`Chromium exited before startup: ${browserLog}`);
    const activePort = resolve(profile, 'DevToolsActivePort');
    if (!existsSync(activePort)) return false;
    const [port, path] = readFileSync(activePort, 'utf8').trim().split(/\r?\n/);
    if (!/^\d+$/.test(port) || !path?.startsWith('/devtools/browser/')) return false;
    endpoint = `ws://127.0.0.1:${port}${path}`;
    return true;
  }, 'Chromium startup', 30000);
  socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let id = 0;
  let sessionId;
  const pending = new Map();
  const errors = [];
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request?.reject(new Error(message.error.message));
      else request?.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map((arg) => arg.value ?? arg.description).join(' '));
  });
  const send = (method, params = {}, useSession = true) => new Promise((resolve, reject) => {
    const requestId = ++id;
    pending.set(requestId, { resolve, reject });
    socket.send(JSON.stringify({ id: requestId, method, params, ...(sessionId && useSession ? { sessionId } : {}) }));
  });
  const target = await send('Target.createTarget', { url: 'about:blank' }, false);
  sessionId = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true }, false)).sessionId;
  await send('Page.enable');
  await send('Runtime.enable');
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  };
  const click = (text) => evaluate(`[...(document.querySelector('[role="dialog"]') ?? document).querySelectorAll('button')].find(element => element.textContent.includes(${JSON.stringify(text)})).click()`);
  const key = async (key, code, number) => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: number, ...(key === 'Enter' ? { text: '\r', unmodifiedText: '\r' } : {}) });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: number });
  };
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:5174/' });
  await waitFor(() => evaluate(`document.querySelectorAll('.hero-menu [role="menuitem"]').length === 4`), 'React menu mount');
  await waitFor(() => evaluate(`document.querySelector('.evoker-menu-item').style.opacity === '1'`), 'entrance completion');
  await waitFor(() => evaluate(`document.querySelectorAll('.wordmark img').length === 2 && [...document.querySelectorAll('.wordmark img')].every(image => image.complete && image.naturalWidth > 0)`), 'official logo loads on the playground');
  assert.equal(await evaluate(`document.querySelector('link[rel="icon"]').getAttribute('type')`), 'image/svg+xml', 'favicon uses the vector mark');
  assert.equal(await evaluate(`document.querySelectorAll('.hero-menu [role="menuitem"][tabindex="0"]').length`), 1);
  assert.equal(await evaluate(`!document.querySelector('.doc-app') && document.activeElement.dataset.id === 'components'`), true, 'front page starts in the standalone playground with keyboard focus');
  assert.equal(await evaluate(`document.querySelectorAll('.hero-menu [role="menuitem"]:disabled').length`), 0, 'all four opening choices work');
  for (const id of ['components', 'motion', 'foundations', 'documentation']) {
    assert.equal(await evaluate(`document.activeElement.dataset.id`), id, 'opening menu follows keyboard focus');
    assert.equal(await evaluate(`getComputedStyle(document.activeElement).outlineStyle`), 'none', 'opening menu uses its selection highlight without a rectangular focus border');
    assert.equal(await evaluate(`document.activeElement.dataset.active === 'true' && document.querySelector('.hero-menu .evoker-selection').getBoundingClientRect().width > 0`), true, 'opening menu retains its visible selection highlight');
    await key('ArrowDown', 'ArrowDown', 40);
  }
  await key('ArrowDown', 'ArrowDown', 40);
  assert.match(await evaluate('document.activeElement.textContent'), /Motion/);
  await key('Enter', 'Enter', 13);
  await waitFor(() => evaluate(`document.querySelector('[role="status"]').textContent === 'Motion section selected'`), 'native keyboard confirmation');
  await evaluate(`document.querySelector('.motion-controls button').focus()`);
  await key('Escape', 'Escape', 27);
  await key('End', 'End', 35);
  assert.match(await evaluate('document.activeElement.textContent'), /Documentation/);
  await key('Enter', 'Enter', 13);
  await waitFor(() => evaluate(`document.querySelector('[data-doc-page="introduction"]') && !document.querySelector('.catalog')`), 'documentation is a separate view');
  await waitFor(() => evaluate(`document.querySelector('.doc-header .wordmark img')?.naturalWidth > 0`), 'documentation shares the official logo');
  await evaluate(`document.querySelector('.doc-header a[href="#"]').click()`);
  await waitFor(() => evaluate(`document.activeElement?.dataset.id === 'components'`), 'return to playground');
  await key('End', 'End', 35);
  await key('ArrowDown', 'ArrowDown', 40);
  assert.match(await evaluate('document.activeElement.textContent'), /Components/);
  await key('Enter', 'Enter', 13);
  assert.equal(await evaluate(`document.activeElement.dataset.componentId`), 'button', 'opening Components enters its keyboard selector');
  for (let index = 0; index < 3; index++) await key('ArrowDown', 'ArrowDown', 40);
  assert.equal(await evaluate(`document.activeElement.dataset.componentId`), 'panel', 'component selector supports arrows from the start');
  await key('Enter', 'Enter', 13);
  assert.equal(await evaluate(`document.activeElement.closest('#demo-panel') !== null`), true, 'selection enters the corresponding demo');
  await key('Escape', 'Escape', 27);
  assert.equal(await evaluate(`document.activeElement.dataset.componentId`), 'panel', 'Escape returns to component selector');
  await evaluate(`document.querySelector('#demo-selection-indicator .specimen-label').click()`);
  assert.equal(await evaluate(`document.activeElement.closest('.cursor-demo') !== null`), true, 'clicking a demo canvas activates its controls');
  await key('ArrowDown', 'ArrowDown', 40);
  assert.match(await evaluate('document.activeElement.textContent'), /Second position/);
  await evaluate(`document.querySelector('#demo-name-entry input').focus()`);
  await key('Home', 'Home', 36);
  await key('ArrowRight', 'ArrowRight', 39);
  assert.equal(await evaluate(`document.activeElement.selectionStart`), 1, 'canvas navigation preserves native text editing');
  await evaluate(`document.querySelector('[role="tab"]').focus()`);
  await key('End', 'End', 35);
  assert.match(await evaluate('document.activeElement.textContent'), /Later/);
  assert.equal(await evaluate(`document.activeElement.getAttribute('aria-disabled')`), 'true');
  await key('ArrowLeft', 'ArrowLeft', 37);
  assert.match(await evaluate('document.activeElement.textContent'), /Details/);
  assert.equal(await evaluate(`document.activeElement.getAttribute('aria-selected')`), 'true');
  assert.equal(await evaluate(`document.querySelectorAll('[role="tabpanel"]:not([hidden])').length`), 1);
  await key('ArrowRight', 'ArrowRight', 39);
  await key('ArrowRight', 'ArrowRight', 39);
  assert.match(await evaluate('document.activeElement.textContent'), /Overview/);
  await evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(element => element.textContent.includes('Open dialog')); button.focus(); button.click(); })()`);
  await waitFor(() => evaluate(`!!document.querySelector('[role="dialog"]')`), 'modal opens');
  assert.equal(await evaluate(`document.querySelector('[role="dialog"]').contains(document.activeElement)`), true);
  for (let index = 0; index < 5; index++) await key('Tab', 'Tab', 9);
  await delay(30);
  assert.equal(await evaluate(`document.querySelector('[role="dialog"]').contains(document.activeElement)`), true, `focus containment: ${await evaluate('document.activeElement.outerHTML.slice(0, 500)')}`);
  await key('Escape', 'Escape', 27);
  await waitFor(() => evaluate(`!document.querySelector('[role="dialog"]')`), 'Escape closes modal');
  assert.match(await evaluate('document.activeElement.textContent'), /Open dialog/);
  await click('Open dialog');
  await click('Confirm');
  await waitFor(() => evaluate(`!document.querySelector('[role="dialog"]') && document.querySelector('[role="status"]').textContent === 'Changes confirmed'`), 'modal confirmation');
  await evaluate(`(() => {
    const slider = document.querySelector('[aria-label="Adjust capacity"]');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(slider, '35');
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await waitFor(() => evaluate(`document.querySelector('#demo-gauge [role="meter"]').getAttribute('aria-valuenow') === '35'`), 'gauge value updates');
  await click('Second position');
  await waitFor(() => evaluate(`document.querySelector('.cursor-demo .evoker-selection').style.transform.includes('48px')`), 'independent cursor position');
  await click('Exit panel');
  assert.equal(await evaluate(`document.querySelector('.transition-example').hasAttribute('inert')`), true, 'exiting content inert immediately');
  await waitFor(() => evaluate(`document.querySelector('.transition-example').hidden`), 'transition exit completes');
  await click('Enter panel');
  await delay(80);
  await click('Exit panel');
  await delay(40);
  await click('Enter panel');
  await waitFor(() => evaluate(`document.querySelector('.transition-example').style.opacity === '1'`), 'interrupted transition returns to visible');
  await evaluate(`(() => { const select = document.querySelector('[aria-label="Motion preference"]'); select.value = 'true'; select.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await click('Exit panel');
  await waitFor(() => evaluate(`document.querySelector('.transition-example').hidden`), 'reduced motion exit');
  await click('Enter panel');
  await waitFor(() => evaluate(`document.querySelector('.transition-example').style.opacity === '1'`), 'reduced motion final pose');
  await click('Replay menu');
  await waitFor(() => evaluate(`document.querySelector('.evoker-menu-item').style.opacity === '1'`), 'reduced motion menu');
  const catalogIds = await evaluate(`[...document.querySelectorAll('.component-index button')].map(button => button.dataset.componentId)`);
  assert.equal(catalogIds.length, 26, 'all blocks are present on the front page');
  assert.equal(await evaluate(`document.querySelector('#demo-quest-brief button').disabled`), true, 'quest rewards start locked');
  for (let index = 0; index < 3; index++) {
    await evaluate(`document.querySelectorAll('#demo-quest-brief input[type="checkbox"]')[${index}].click()`);
    await waitFor(() => evaluate(`document.querySelector('#demo-quest-brief [role="progressbar"]').getAttribute('aria-valuenow') === '${index + 1}'`), 'objective progress updates');
  }
  await evaluate(`document.querySelector('#demo-quest-brief button').click()`);
  await waitFor(() => evaluate(`document.querySelector('#demo-quest-brief output').textContent.includes('+120 credits received')`), 'quest claim unlocks the reward');
  await evaluate(`document.querySelector('#demo-quest-brief button').click()`);
  await waitFor(() => evaluate(`document.querySelector('#demo-quest-brief [role="progressbar"]').getAttribute('aria-valuenow') === '0'`), 'quest can restart');
  await evaluate(`document.querySelector('#demo-contact-tile .source-action').click()`);
  await waitFor(() => evaluate(`document.querySelector('#demo-contact-tile [data-unread]').dataset.unread === 'true'`), 'Mark unread changes the contact');
  assert.equal(await evaluate(`document.querySelector('#demo-contact-tile .source-action').disabled`), true, 'already-unread action is explicit');
  await evaluate(`document.querySelector('#demo-contact-tile .evoker-contact').click()`);
  await waitFor(() => evaluate(`document.querySelector('#demo-contact-tile [data-unread]').dataset.unread === 'false' && !!document.querySelector('#demo-contact-tile .source-message')`), 'opening contact reads the message');
  await evaluate(`document.querySelector('#demo-panel button').click()`);
  await waitFor(() => evaluate(`document.querySelector('#demo-panel [role="meter"]').getAttribute('aria-valuenow') === '3'`), 'Panel demo actions update real content');
  await evaluate(`(() => { const append = document.querySelector('#demo-message-log > .source-stack > button'); for (let index = 0; index < 24; index++) append.click(); })()`);
  await waitFor(() => evaluate(`document.querySelectorAll('#demo-message-log [role="log"] li').length === 25`), 'populate playground history');
  await evaluate(`document.querySelector('#demo-message-log [role="log"]').focus()`);
  await key('ArrowDown', 'ArrowDown', 40);
  await waitFor(() => evaluate(`document.activeElement.getAttribute('role') === 'log' && document.activeElement.scrollTop > 0`), 'playground preserves native log scrolling');
  await key('Escape', 'Escape', 27);
  assert.equal(await evaluate(`document.activeElement.dataset.componentId`), 'message-log', 'demo focus tracks the matching component selector');
  for (const [time, period] of [['04:59', 'Night'], ['05:00', 'Morning'], ['11:59', 'Morning'], ['12:00', 'Afternoon'], ['16:59', 'Afternoon'], ['17:00', 'Evening'], ['20:59', 'Evening'], ['21:00', 'Night']]) {
    await evaluate(`(() => { const input = document.querySelector('#demo-date-badge input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '2026-11-10T${time}'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await waitFor(() => evaluate(`document.querySelector('#demo-date-badge time').getAttribute('aria-label').includes('${period}')`), `time-of-day preview ${time}`);
  }
  await delay(1100);
  assert.equal(await evaluate(`document.querySelector('#demo-date-badge input').value`), '2026-11-10T21:00', 'manual time preview stays fixed');
  await evaluate(`(() => { window.__realDate = Date; window.__clockTime = new Date(2026, 10, 10, 23, 59).getTime(); window.Date = class extends window.__realDate { constructor(...args) { if (args.length) super(...args); else super(window.__clockTime); } static now() { return window.__clockTime; } }; document.querySelector('#demo-date-badge button').click(); })()`);
  await waitFor(() => evaluate(`document.querySelector('#demo-date-badge input').value === '2026-11-10T23:59'`), 'current-time action uses live local time');
  await evaluate(`window.__clockTime = new window.__realDate(2026, 10, 11, 5, 0).getTime()`);
  await waitFor(() => evaluate(`document.querySelector('#demo-date-badge input').value === '2026-11-11T05:00' && document.querySelector('#demo-date-badge time').getAttribute('aria-label').includes('Morning')`), 'live clock updates date and period');
  await evaluate(`window.Date = window.__realDate; delete window.__realDate; delete window.__clockTime`);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'desktop horizontal overflow');
  await evaluate('window.scrollTo(0, 0)');
  if (process.env.EVOKER_SCREENSHOTS) {
    writeFileSync(resolve(process.env.EVOKER_SCREENSHOTS, 'evoker-desktop.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })).data, 'base64'));
  }
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.reload');
  await waitFor(() => evaluate(`document.querySelectorAll('.hero-menu [role="menuitem"]').length === 4 && document.querySelector('.evoker-menu-item').style.opacity === '1'`), 'system reduced-motion preference');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'mobile horizontal overflow');
  assert.equal(await evaluate(`document.querySelectorAll('.hero-menu [role="menuitem"][tabindex="0"]').length`), 1);
  assert.equal(await evaluate(`document.querySelector('.transition-example').style.opacity`), '1');
  await click('Open dialog');
  await waitFor(() => evaluate(`!!document.querySelector('[role="dialog"]')`), 'mobile modal');
  assert.equal(await evaluate(`document.querySelector('[role="dialog"]').getBoundingClientRect().width <= window.innerWidth`), true);
  await key('Escape', 'Escape', 27);
  await waitFor(() => evaluate(`!document.querySelector('[role="dialog"]')`), 'mobile modal closes');
  await evaluate('window.scrollTo(0, 0)');
  if (process.env.EVOKER_SCREENSHOTS) {
    writeFileSync(resolve(process.env.EVOKER_SCREENSHOTS, 'evoker-mobile.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })).data, 'base64'));
  }
  console.log(await evaluate(`import('/@fs' + ${JSON.stringify(resolve(root, 'scripts/component-checks.tsx'))}).then(module => module.runComponentChecks())`));
  console.log(await evaluate(`import('/@fs' + ${JSON.stringify(resolve(root, 'scripts/source-component-checks.tsx'))}).then(module => module.runSourceComponentChecks())`));
  console.log(await evaluate(`import('/@fs' + ${JSON.stringify(resolve(root, 'scripts/primitive-checks.tsx'))}).then(module => module.runPrimitiveChecks())`));
  console.log(await evaluate(`import('/@fs' + ${JSON.stringify(resolve(root, 'scripts/composition-checks.tsx'))}).then(module => module.runCompositionChecks())`));
  const route = async (id) => {
    await evaluate(`location.hash = ${JSON.stringify('#/docs/' + id)}`);
    await waitFor(() => evaluate(`document.querySelector('[data-doc-page]')?.getAttribute('data-doc-page') === ${JSON.stringify(id)}`), `documentation route ${id}`);
  };
  for (const id of catalogIds) {
    await route(id);
    assert.equal(await evaluate(`!!document.querySelector('.doc-api') && !document.querySelector('.catalog')`), true, `documentation covers playground component ${id}`);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, `mobile block documentation ${id} overflow`);
  }
  for (const id of ['installation', 'input', 'textarea', 'field', 'checkbox', 'switch', 'select', 'slider', 'dialog', 'tabs', 'card', 'badge', 'tooltip', 'dropdown-menu', 'theming', 'button']) await route(id);
  await click('Save changes');
  await waitFor(() => evaluate(`document.querySelector('.doc-preview output')?.textContent === 'Saved 1 times'`), 'button documentation example');
  assert.equal(await evaluate(`document.querySelector('.doc-preview [aria-busy="true"]').disabled`), true, 'loading button disabled');
  await route('input');
  await evaluate(`(() => { const input = document.querySelector('.doc-preview input[name="email"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'reader@example.com'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await click('Create account');
  await waitFor(() => evaluate(`document.querySelector('.doc-preview output').textContent.includes('reader@example.com')`), 'real form submission example');
  await route('dialog');
  await evaluate(`document.querySelector('[aria-label="Toggle appearance"]').click()`);
  await click('Edit profile');
  await waitFor(() => evaluate(`!!document.querySelector('[role="dialog"]')`), 'compound documentation dialog');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[role="dialog"]')).backgroundColor`), 'rgb(255, 255, 255)', 'portalled light theme');
  await evaluate(`(() => { const input = document.querySelector('[role="dialog"] input[name="displayName"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Reader'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await click('Save profile');
  await waitFor(() => evaluate(`!document.querySelector('[role="dialog"]') && document.querySelector('.doc-preview output').textContent === 'Saved Reader'`), 'controlled dialog form saves caller data');
  await route('dropdown-menu');
  await click('Project actions');
  await waitFor(() => evaluate(`!!document.querySelector('.evoker-menu-action')`), 'dropdown opens');
  await evaluate(`[...document.querySelectorAll('.evoker-menu-action')].find(element => element.textContent === 'Export').click()`);
  await waitFor(() => evaluate(`document.querySelector('.doc-preview output').textContent === 'Project exported'`), 'dropdown action');
  await route('tooltip');
  await evaluate(`document.querySelector('.doc-content .evoker-tabs-content:not([hidden])').focus()`);
  await key('Tab', 'Tab', 9);
  await waitFor(() => evaluate(`document.querySelector('[role="tooltip"]')?.textContent === 'Use Tab to move between controls.'`), 'tooltip opens on real keyboard focus');
  await key('Escape', 'Escape', 27);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'mobile documentation overflow');
  await route('button');
  await evaluate(`document.querySelector('[aria-label="Toggle appearance"]').click()`);
  const compositionRoutes = ['party-panel', 'result-summary', 'message-log', 'action-bar', 'status-dialog'];
  for (const id of compositionRoutes) {
    await route(id);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, `mobile ${id} overflow`);
    await evaluate(`document.querySelector('[aria-label="Toggle appearance"]').click()`);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, `mobile alternate theme ${id} overflow`);
    await evaluate(`document.querySelector('[aria-label="Toggle appearance"]').click()`);
  }
  await route('party-panel');
  await evaluate(`document.querySelector('[data-member-id="ren"] button').focus()`);
  await key('Enter', 'Enter', 13);
  await waitFor(() => evaluate(`document.querySelector('.doc-preview output')?.textContent === 'Selected: Ren'`), 'native party selection');
  await route('result-summary');
  await click('Accept results');
  await waitFor(() => evaluate(`document.querySelector('.doc-preview output')?.textContent === 'Results accepted'`), 'supplied result actions');
  await route('message-log');
  await click('Append message');
  await waitFor(() => evaluate(`document.querySelectorAll('.evoker-message-log li').length === 2`), 'history example appends');
  await route('action-bar');
  await evaluate(`document.querySelector('.evoker-action-bar button').focus()`);
  await key('Enter', 'Enter', 13);
  await waitFor(() => evaluate(`document.querySelector('.doc-preview output')?.textContent === 'Action: inspect'`), 'native action Enter');
  await key('Tab', 'Tab', 9);
  assert.equal(await evaluate(`document.activeElement.textContent.includes('Confirm')`), true, 'action group uses ordinary Tab order');
  await key(' ', 'Space', 32);
  await waitFor(() => evaluate(`document.querySelector('.doc-preview output')?.textContent === 'Action: confirm'`), 'native action Space');
  await route('status-dialog');
  await evaluate(`document.querySelector('.doc-preview button').focus()`);
  await key('Enter', 'Enter', 13);
  await waitFor(() => evaluate(`!!document.querySelector('.evoker-status-dialog')`), 'status example opens');
  await waitFor(() => evaluate(`document.activeElement.textContent.includes('Retry connection')`), 'status initial focus');
  await key('Tab', 'Tab', 9);
  await waitFor(() => evaluate(`document.querySelector('.evoker-status-dialog')?.contains(document.activeElement)`), 'status focus remains trapped');
  await click('Retry connection');
  await waitFor(() => evaluate(`document.querySelector('.doc-preview output')?.textContent === 'Connection restored'`), 'caller-owned status retry');
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 2, y: 2, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 2, y: 2, button: 'left', clickCount: 1 });
  await waitFor(() => evaluate(`!document.querySelector('.evoker-status-dialog')`), 'status outside press dismissal');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  for (const id of compositionRoutes) {
    await route(id);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, `desktop ${id} overflow`);
    await evaluate(`document.querySelector('[aria-label="Toggle appearance"]').click()`);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, `desktop alternate theme ${id} overflow`);
    await evaluate(`document.querySelector('[aria-label="Toggle appearance"]').click()`);
  }
  await evaluate(`(() => { const input = document.querySelector('[aria-label="Find a component"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'PartyPanel'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await waitFor(() => evaluate(`document.querySelector('nav[aria-label="Component pages"] a[href="#/docs/party-panel"]') && !document.querySelector('nav[aria-label="Component pages"] a[href="#/docs/action-bar"]')`), 'composition search');
  await route('party-panel');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'desktop documentation overflow');
  if (process.env.EVOKER_SCREENSHOTS) {
    writeFileSync(resolve(process.env.EVOKER_SCREENSHOTS, 'evoker-docs.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })).data, 'base64'));
  }
  await route('contact-tile');
  await send('Page.reload');
  await waitFor(() => evaluate(`document.querySelector('[data-doc-page="contact-tile"]') && !document.querySelector('.catalog')`), 'direct documentation URL survives reload');
  await evaluate(`location.hash = '/panel'`);
  await waitFor(() => evaluate(`document.querySelector('[data-doc-page="panel"] h1')?.textContent === 'Panel'`), 'legacy component URL remains supported');
  await evaluate(`location.hash = ''`);
  await waitFor(() => evaluate(`!!document.querySelector('.catalog') && !document.querySelector('.doc-app') && document.activeElement?.dataset.id === 'components'`), 'return to standalone front page');
  await evaluate(`history.back()`);
  await waitFor(() => evaluate(`document.querySelector('[data-doc-page="panel"]') && !document.querySelector('.catalog')`), 'browser Back restores documentation');
  await evaluate(`history.forward()`);
  await waitFor(() => evaluate(`document.querySelector('.catalog') && !document.querySelector('.doc-app')`), 'browser Forward restores playground');
  await runResponsiveChecks({ send, evaluate, waitFor, key });
  assert.deepEqual(errors, [], 'browser runtime errors');
  console.log('Browser smoke passed: block interactions, primitive contracts, all documentation routes, real forms, compound dialog/theme, dropdown, reduced motion, desktop/mobile layout, no runtime errors.');
} catch (error) {
  console.error(error);
  if (!socket) console.error(serverLog.slice(-1000), browserLog.slice(-1000));
  process.exitCode = 1;
} finally {
  socket?.close();
  const exited = (child) => child.exitCode !== null || child.signalCode !== null ? Promise.resolve() : new Promise((resolve) => child.once('exit', resolve));
  const exits = [exited(server), exited(browser)];
  server.kill('SIGTERM'); browser.kill('SIGTERM');
  await Promise.all(exits);
  rmSync(profile, { recursive: true, force: true });
}
