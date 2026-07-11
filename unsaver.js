var unsave = (() => {
  const DEFAULTS = {
    menuOpenDelay: 120,
    removeDelay: 380,
    pollInterval: 90,
    menuTimeout: 2500,
    loadWait: 3000,
    maxStable: 3,
  };
  const cfg = Object.assign({}, DEFAULTS, window.__fbUnsaverConfig || {});

  const MORE_LABELS = ['More options for saved item', 'More'];
  const MORE_SELECTOR = MORE_LABELS.map(l => `[aria-label="${l}"]`).join(',');

  const REMOVE_EXACT = ['unsave'];
  const REMOVE_PREFIX = ['remove from'];

  let total = 0;
  let stopped = false;

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function scroller() {
    return document.scrollingElement || document.documentElement;
  }

  const read = {
    filter(el) {
      return !el.dataset.unsaveSkip;
    },
    mark(el) {
      el.dataset.unsaveSkip = 'true';
    },
  };

  const dom = {
    main() {
      return document.querySelector('[role=main]') || document;
    },
    allMoreButtons() {
      return Array.from(dom.main().querySelectorAll(MORE_SELECTOR));
    },
    getMoreButtons() {
      return dom.allMoreButtons().filter(read.filter);
    },
    getRemoveMenuItems() {
      const items = Array.from(document.querySelectorAll('[role=menuitem]'));
      return items.filter(item => {
        const text = (item.textContent || '').trim().toLowerCase();
        if (!text) return false;
        if (REMOVE_EXACT.includes(text)) return true;
        return REMOVE_PREFIX.some(prefix => text.startsWith(prefix));
      });
    },
    isLoading() {
      const main = dom.main();
      return !!main.querySelector('[role=progressbar], [aria-busy="true"]');
    },
    closeMenu() {
      document.body.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true,
        })
      );
    },
  };

  async function waitForRemoveItem() {
    const deadline = Date.now() + cfg.menuTimeout;
    while (Date.now() < deadline) {
      const item = dom.getRemoveMenuItems()[0];
      if (item) return item;
      await delay(cfg.pollInterval);
    }
    return null;
  }

  async function processNext() {
    const button = dom.getMoreButtons()[0];
    if (!button) return 'none';

    button.scrollIntoView({ block: 'center' });
    button.click();
    await delay(cfg.menuOpenDelay);

    const item = await waitForRemoveItem();
    if (item) {
      item.click();
      total += 1;
      report(true);
      ui.update();
      await delay(cfg.removeDelay);
      return 'removed';
    }

    read.mark(button);
    dom.closeMenu();
    await delay(150);
    return 'skipped';
  }

  async function loadMore() {
    const startCount = dom.allMoreButtons().length;
    const hardDeadline = Date.now() + Math.max(cfg.loadWait * 3, 8000);
    let deadline = Date.now() + cfg.loadWait;

    scroller().scrollTo(0, scroller().scrollHeight);

    while (Date.now() < deadline && Date.now() < hardDeadline) {
      await delay(250);
      if (dom.getMoreButtons()[0]) return true;
      if (dom.allMoreButtons().length > startCount) return true;
      if (dom.isLoading()) {
        deadline = Math.min(hardDeadline, Date.now() + cfg.loadWait);
      }
      scroller().scrollTo(0, scroller().scrollHeight);
    }

    return dom.getMoreButtons()[0]
      ? true
      : dom.allMoreButtons().length > startCount;
  }

  function report(running) {
    if (window.__fbUnsaverControl) window.__fbUnsaverControl.total = total;
    try {
      chrome.storage &&
        chrome.storage.local.set({ fbu_running: running, fbu_cleared: total });
      chrome.runtime.sendMessage(
        { type: 'fbu_progress', running, cleared: total },
        () => void chrome.runtime.lastError
      );
    } catch (_) {
    }
  }

  const ui = {
    el: null, count: null, sub: null,
    make() {
      const existing = document.getElementById('fb-unsaver-banner');
      if (existing) existing.remove();

      const box = document.createElement('div');
      box.id = 'fb-unsaver-banner';
      box.setAttribute('role', 'status');
      box.style.cssText = [
        'position:fixed', 'top:16px', 'right:16px', 'z-index:2147483647',
        'min-width:210px', 'background:#ffffff', 'color:#141a17',
        'font:400 13px/1.35 -apple-system,"Segoe UI",Roboto,sans-serif',
        'padding:14px 16px', 'border-radius:14px',
        'box-shadow:0 12px 34px rgba(8,25,20,.22)', 'border:1px solid #e4e9e6',
      ].join(';');

      const top = document.createElement('div');
      top.style.cssText = 'display:flex;align-items:center;gap:10px;';

      const dot = document.createElement('span');
      dot.style.cssText =
        'width:9px;height:9px;border-radius:50%;background:#0fb985;box-shadow:0 0 0 4px rgba(15,185,133,.18);flex:none';

      const count = document.createElement('div');
      count.style.cssText =
        'font-weight:800;font-size:22px;letter-spacing:-.02em;font-variant-numeric:tabular-nums;';
      count.textContent = '0';

      const label = document.createElement('div');
      label.textContent = 'cleared';
      label.style.cssText = 'color:#5e6b64;font-size:12px;margin-left:auto;';

      top.appendChild(dot);
      top.appendChild(count);
      top.appendChild(label);

      const sub = document.createElement('div');
      sub.textContent = 'Sweeping your saved items…';
      sub.style.cssText = 'color:#5e6b64;margin:8px 0 12px;';

      const stopBtn = document.createElement('button');
      stopBtn.textContent = 'Stop';
      stopBtn.style.cssText = [
        'width:100%', 'background:#fdecec', 'color:#c62a2f', 'border:1px solid #f4c9cb',
        'cursor:pointer', 'font:600 13px/1 -apple-system,"Segoe UI",Roboto,sans-serif',
        'padding:9px 12px', 'border-radius:9px',
      ].join(';');
      stopBtn.addEventListener('click', () => {
        stopped = true;
        stopBtn.textContent = 'Stopping…';
        stopBtn.disabled = true;
      });

      box.appendChild(top);
      box.appendChild(sub);
      box.appendChild(stopBtn);
      document.body.appendChild(box);
      this.el = box; this.count = count; this.sub = sub;
    },
    update(subtext) {
      if (this.count) this.count.textContent = total.toLocaleString();
      if (subtext && this.sub) this.sub.textContent = subtext;
    },
    finish(message) {
      if (!this.el) return;
      if (this.sub) this.sub.textContent = message;
      const btn = this.el.querySelector('button');
      if (btn) btn.remove();
      const dot = this.el.querySelector('span');
      if (dot) dot.style.background = '#9aa4ac';
      setTimeout(() => this.el && this.el.remove(), 6000);
    },
  };

  return async () => {
    if (window.__fbUnsaverRunning) {
      console.warn('[fb-unsaver] Already running — request ignored.');
      return;
    }
    window.__fbUnsaverRunning = true;
    window.__fbUnsaverControl = { stop: () => { stopped = true; }, total: 0 };

    if (!window.__fbUnsaverListener) {
      window.__fbUnsaverListener = true;
      try {
        chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
          const ctl = window.__fbUnsaverControl || {};
          if (msg && msg.type === 'fbu_ping') {
            sendResponse({ running: !!window.__fbUnsaverRunning, cleared: ctl.total || 0 });
          } else if (msg && msg.type === 'fbu_stop') {
            if (ctl.stop) ctl.stop();
            sendResponse({ ok: true });
          }
          return true;
        });
      } catch (_) {  }
    }

    stopped = false;
    total = 0;
    ui.make();
    report(true);
    console.log('[fb-unsaver] Started.');

    let stable = 0;
    try {
      while (!stopped) {
        while (!stopped && dom.getMoreButtons()[0]) {
          await processNext();
        }
        if (stopped) break;

        ui.update(total ? 'Loading more items…' : 'Looking for saved items…');
        const grew = await loadMore();
        if (grew) {
          stable = 0;
        } else {
          stable += 1;
          if (stable >= cfg.maxStable) break;
        }
      }
    } catch (err) {
      console.error('[fb-unsaver] Error:', err);
    } finally {
      window.__fbUnsaverRunning = false;
      report(false);
      const message = stopped
        ? `Stopped — cleared ${total.toLocaleString()}.`
        : total
          ? `Done — cleared ${total.toLocaleString()}.`
          : 'No saved items found here.';
      console.log('[fb-unsaver] ' + message);
      ui.update();
      ui.finish(message);
    }
  };
})();

unsave();
