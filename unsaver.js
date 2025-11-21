var unsave = (() => {
    let total = 0;
    const REMOVE_TEXTS = ['Unsave', 'Remove from collection'].map(str => {
      return str.toLowerCase();
    });
  
    function delay(ms = 1000) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    const read = {
      clear() {
        /** @type {HTMLElement[]} */
        const elements = Array.from(
          document.querySelectorAll('[data-unsave="true"]')
        );
        for (const element of elements) {
          delete element.dataset.unsave;
        }
      },
      /** @param {HTMLElement} element */
      filter(element) {
        return !element.dataset.unsave;
      },
      /** @param {HTMLElement[]} elements */
      mark(elements) {
        for (const element of elements) {
          element.dataset.unsave = 'true';
        }
      }
    };
  
    const dom = {
      getMoreButtons() {
        /** @type {HTMLElement[]} */
        const buttons = Array.from(
          document
            .querySelector('[role=main]')
            .querySelectorAll('[aria-label="More"]')
        ).slice(1);
        return buttons.filter(read.filter);
      },
      getRemoveMenuItems() {
        /** @type {HTMLElement[]} */
        const menuItems = Array.from(
          document.querySelectorAll('[role=menuitem]')
        );
        return menuItems.filter(menuItem => {
          const text = (menuItem.textContent || '').trim().toLowerCase();
          return read.filter(menuItem) && REMOVE_TEXTS.includes(text);
        });
      }
    };
  
    const run = {
      async remove() {
        const elements = dom.getRemoveMenuItems();
        read.mark(elements);
        for (const element of elements) {
          element.click();
          console.log('[fb-unsaver] Removed item: %o', ++total);
          await delay();
        }
        if (elements.length > 0) {
          await delay();
        }
      },
      async openAndRemove() {
        const elements = dom.getMoreButtons();
        read.mark(elements);
        for (const element of elements) {
          element.click();
          await delay();
          // remove for open menus
          run.remove();
        }
        if (elements.length > 0) {
          await delay();
        }
      }
    };
  
    return async () => {
      console.log('[fb-unsaver] Running fb-unsaver. Close tab to stop.');
      while (true) {
        read.clear();
        await run.remove();
        await run.openAndRemove();
        await run.remove();
        read.clear();
        console.log('[fb-unsaver] Total removed: %o', total);
  
        const elements = {
          more: dom.getMoreButtons().length,
          remove: dom.getRemoveMenuItems().length
        };
        if (elements.more + elements.remove === 0) {
          const message = '[fb-unsaver] Stopping. No more items to remove.';
          console.log(message);
          alert(message);
          break;
        }
        console.log(
          '[fb-unsaver] Found (%o, %o) to remove. Continuing fb-unsaver.',
          elements.more,
          elements.remove
        );
      }
    };
  })();
  
  unsave();