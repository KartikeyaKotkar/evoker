import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

// Uses an installed Chromium browser and the native DevTools protocol; no test runtime dependency.
const executable = process.env.CHROME_PATH ?? ['/opt/google/chrome/chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync);
if (!executable) throw new Error('Set CHROME_PATH to an installed Chromium executable.');
const root = resolve(import.meta.dirname, '..');
const profile = mkdtempSync(resolve(tmpdir(), 'evoker-browser-'));
const server = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '5174', '--strictPort'], { cwd: resolve(root, 'playground'), stdio: ['ignore', 'pipe', 'pipe'] });
const browser = spawn(executable, ['--headless', '--no-sandbox', '--disable-dev-shm-usage', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
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
  await waitFor(() => serverLog.includes('127.0.0.1:5174'), 'Vite startup');
  await waitFor(() => browserLog.includes('DevTools listening on '), 'Chromium startup');
  const endpoint = /DevTools listening on (ws:\/\/[^\s]+)/.exec(browserLog)[1];
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
  const click = (text) => evaluate(`[...document.querySelectorAll('button')].find(element => element.textContent.includes(${JSON.stringify(text)})).click()`);
  const key = async (key, code, number) => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: number, ...(key === 'Enter' ? { text: '\r', unmodifiedText: '\r' } : {}) });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: number });
  };
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:5174/#/blocks' });
  await waitFor(() => evaluate(`document.querySelectorAll('.hero-menu [role="menuitem"]').length === 4`), 'React menu mount');
  await waitFor(() => evaluate(`document.querySelector('.evoker-menu-item').style.opacity === '1'`), 'entrance completion');
  assert.equal(await evaluate(`document.querySelectorAll('.hero-menu [role="menuitem"][tabindex="0"]').length`), 1);
  await evaluate(`document.querySelector('[role="menuitem"]').focus()`);
  await key('ArrowDown', 'ArrowDown', 40);
  assert.match(await evaluate('document.activeElement.textContent'), /Motion/);
  await key('Enter', 'Enter', 13);
  await waitFor(() => evaluate(`document.querySelector('[role="status"]').textContent === 'Motion section selected'`), 'native keyboard confirmation');
  await key('End', 'End', 35);
  assert.match(await evaluate('document.activeElement.textContent'), /Foundations/);
  await key('ArrowDown', 'ArrowDown', 40);
  assert.match(await evaluate('document.activeElement.textContent'), /Components/);
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
  await waitFor(() => evaluate(`document.querySelector('[role="meter"]').getAttribute('aria-valuenow') === '35'`), 'gauge value updates');
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
  const route = async (id) => {
    await evaluate(`location.hash = ${JSON.stringify('#/' + id)}`);
    await waitFor(() => evaluate(`document.querySelector('[data-doc-page]')?.getAttribute('data-doc-page') === ${JSON.stringify(id)}`), `documentation route ${id}`);
  };
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
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'desktop documentation overflow');
  if (process.env.EVOKER_SCREENSHOTS) {
    writeFileSync(resolve(process.env.EVOKER_SCREENSHOTS, 'evoker-docs.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })).data, 'base64'));
  }
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
