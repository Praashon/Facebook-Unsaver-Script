const SPEEDS = {
  safe:     { menuOpenDelay: 250, removeDelay: 750, pollInterval: 150, menuTimeout: 3000, loadWait: 3500, maxStable: 4 },
  balanced: { menuOpenDelay: 120, removeDelay: 380, pollInterval:  90, menuTimeout: 2500, loadWait: 3000, maxStable: 3 },
  fast:     { menuOpenDelay:  60, removeDelay: 200, pollInterval:  60, menuTimeout: 2000, loadWait: 2500, maxStable: 3 },
};

const el = {
  live: document.getElementById('live'),
  stage: document.getElementById('stage'),
  offsite: document.getElementById('offsite'),
  controls: document.getElementById('controls'),
  eyebrow: document.getElementById('eyebrow'),
  count: document.getElementById('count'),
  totalSaved: document.getElementById('totalSaved'),
  sweep: document.getElementById('sweep'),
  status: document.getElementById('status'),
  segs: document.getElementById('segs'),
  cta: document.getElementById('cta'),
  openSaved: document.getElementById('openSaved'),
  fineprint: document.getElementById('fineprint'),
};

let speed = 'balanced';
let running = false;

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function isFacebook(tab) {
  return !!(tab && tab.url && /:\/\/([\w-]+\.)*facebook\.com\//.test(tab.url));
}

function setCount(n) {
  el.count.textContent = Number(n || 0).toLocaleString();
}

function showRunning() {
  running = true;
  el.live.hidden = false;
  el.sweep.dataset.active = 'true';
  el.eyebrow.textContent = 'Clearing…';
  el.status.textContent = 'Sweeping your saved items. Keep this tab open.';
  el.cta.textContent = 'Stop';
  el.cta.classList.add('stop');
  el.cta.disabled = false;
  el.fineprint.textContent = 'Working… you can stop anytime.';
}

function showIdle(cleared) {
  running = false;
  el.live.hidden = true;
  el.sweep.dataset.active = 'false';
  el.cta.textContent = 'Start cleaning';
  el.cta.classList.remove('stop');
  el.cta.disabled = false;
  if (cleared > 0) {
    el.eyebrow.textContent = 'Last run';
    el.status.textContent = 'Finished. Run again to catch any that reloaded.';
  } else {
    el.eyebrow.textContent = 'Cleared this run';
    el.status.textContent = 'Ready when you are.';
  }
  el.fineprint.textContent = 'Unsaved items can’t be restored. You can stop anytime.';
}

function showOffsite() {
  el.stage.hidden = true;
  el.controls.hidden = true;
  el.offsite.hidden = false;
  el.cta.hidden = true;
  el.openSaved.hidden = false;
  el.live.hidden = true;
  el.fineprint.textContent = 'You’ll be taken to facebook.com/saved.';
}

async function getTotalSavedFromPage(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const text = document.body.innerText;
        const match = text.match(/(?:^|\n)([\d,]+)\s+items?(?:\n|$)/i);
        if (match) {
          return parseInt(match[1].replace(/,/g, ''), 10);
        }
        return null;
      },
    });
    return results && results[0] && results[0].result !== null ? results[0].result : null;
  } catch (e) {
    return null;
  }
}

async function start() {
  const tab = await activeTab();
  if (!isFacebook(tab)) return showOffsite();

  el.cta.disabled = true;
  el.cta.textContent = 'Starting…';
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (config) => { window.__fbUnsaverConfig = config; },
      args: [SPEEDS[speed]],
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['unsaver.js'],
    });
    showRunning();
  } catch (err) {
    el.cta.disabled = false;
    el.cta.textContent = 'Start cleaning';
    el.status.textContent = 'Couldn’t start here. Reload the Saved page and retry.';
    console.error(err);
  }
}

async function stop() {
  el.cta.disabled = true;
  el.cta.textContent = 'Stopping…';
  const tab = await activeTab();
  try { await chrome.tabs.sendMessage(tab.id, { type: 'fbu_stop' }); } catch (_) {}
}

async function openSaved() {
  const tab = await activeTab();
  await chrome.tabs.update(tab.id, { url: 'https://www.facebook.com/saved' });
  window.close();
}

function setSpeed(next) {
  speed = next;
  for (const btn of el.segs.querySelectorAll('.seg')) {
    btn.setAttribute('aria-pressed', String(btn.dataset.speed === next));
  }
  chrome.storage.local.set({ fbu_speed: next });
}

el.cta.addEventListener('click', () => (running ? stop() : start()));
el.openSaved.addEventListener('click', openSaved);
el.segs.addEventListener('click', (e) => {
  const btn = e.target.closest('.seg');
  if (btn) setSpeed(btn.dataset.speed);
});

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || msg.type !== 'fbu_progress') return;
  setCount(msg.cleared);
  if (msg.running) showRunning();
  else showIdle(msg.cleared);
});

(async function init() {
  const stored = await chrome.storage.local.get(['fbu_speed', 'fbu_cleared']);
  setSpeed(stored.fbu_speed || 'balanced');

  const tab = await activeTab();
  if (!isFacebook(tab)) return showOffsite();

  const totalSaved = await getTotalSavedFromPage(tab.id);
  if (totalSaved !== null) {
    el.totalSaved.textContent = `Total saved: ${totalSaved.toLocaleString()}`;
    el.totalSaved.hidden = false;
  }

  try {
    const res = await chrome.tabs.sendMessage(tab.id, { type: 'fbu_ping' });
    setCount(res?.cleared || 0);
    if (res?.running) showRunning();
    else showIdle(res?.cleared || 0);
  } catch (_) {
    setCount(0);
    showIdle(0);
  }
})();
