(function () {
  'use strict';

  var SIZE_LABEL_PATTERN = /^(size|maat|gr[oö]ße|taille|tama[nñ]o|dimensioni|tamanho)\b/i;
  var INJECTED_FLAG = 'sizeChartInjected';

  function getChartSource() {
    var el = document.querySelector('[data-size-chart-source]');
    return el ? el.innerHTML.trim() : '';
  }

  function getChartTitle() {
    var label = (window.theme && window.theme.strings && window.theme.strings.sizeChart) || 'Size chart';
    var icon = '<svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-size-chart" viewBox="0 0 64 64" style="width:1.4em;height:1.4em;vertical-align:middle;"><path d="M22.39 33.53c-7.46 0-13.5-3.9-13.5-8.72s6-8.72 13.5-8.72 13.5 3.9 13.5 8.72a12 12 0 0 1-.22 1.73"/><ellipse cx="22.39" cy="24.81" rx="3.28" ry="2.12"/><path d="M8.89 24.81V38.5c0 7.9 6.4 9.41 14.3 9.41h31.92V33.53H22.39m24.39 0v7.44m-8.13-7.44v7.44m-8.13-7.44v7.44m-8.13-7.44v7.44"/></svg>';
    return label + ' ' + icon;
  }

  function isSizeLabelText(text) {
    return !!text && SIZE_LABEL_PATTERN.test(text.trim());
  }

  function buildTriggerHtml() {
    return (
      '<span class="variant__label-info size-chart-trigger-injected" style="margin-left:0.4em;">' +
        '&mdash;&nbsp; ' +
        '<button type="button" class="tool-tip-trigger" data-size-chart-trigger style="font-size:1.008em;vertical-align:baseline;">' +
          '<span class="tool-tip-trigger__title">' + getChartTitle() + '</span>' +
        '</button>' +
      '</span>'
    );
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function getProductName() {
    var el = document.querySelector('.product-single__title, .product__title');
    var name = el ? el.textContent.trim() : '';
    if (!name) {
      var attrEl = document.querySelector('[data-product-title]');
      if (attrEl) name = (attrEl.getAttribute('data-product-title') || '').trim();
    }
    if (!name) {
      name = (document.title || '').split(/\s+[–|]\s+/)[0].trim();
    }
    if (name.length > 120) name = '';
    return name;
  }

  function buildPopupContent(chartHtml) {
    var productName = getProductName();
    return (
      '<div style="text-align:center;margin-bottom:1em;">' +
        (productName ? '<h2 style="margin:0 0 0.25em;font-size:1.4em;">' + escapeHtml(productName) + '</h2>' : '') +
        '<div style="font-size:0.9em;letter-spacing:0.1em;text-transform:uppercase;opacity:0.7;">Size chart</div>' +
      '</div>' +
      '<hr style="border:0;border-top:1px solid currentColor;opacity:0.2;margin:0 0 1em;">' +
      '<div class="size-chart-unit-toggle" role="group" aria-label="Unit">' +
        '<button type="button" class="size-chart-unit-btn is-active" data-size-chart-unit="in" aria-pressed="true">INCH</button>' +
        '<button type="button" class="size-chart-unit-btn" data-size-chart-unit="cm" aria-pressed="false">CM</button>' +
      '</div>' +
      '<p style="font-size:0.9em;font-style:italic;text-align:center;margin:0 0 1em;opacity:0.8;">If you\'re in between sizes, we recommend going one size up for extra comfort.</p>' +
      '<div class="size-chart-table-wrap" data-size-chart-unit="in">' + chartHtml + '</div>'
    );
  }

  var HAS_DIGIT_RE = /\d/;
  var IN_LABEL_RE = /\bin(?:ch(?:es)?)?\b\.?/gi;

  function inchesToCm(num) {
    return String(Math.round(num * 2.54));
  }

  function convertNumericCells(wrap, unit) {
    if (!wrap || wrap.getAttribute('data-size-chart-unit') === unit) return;
    var cells = wrap.querySelectorAll('td, th');
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var original = cell.getAttribute('data-in-text');
      if (original === null) {
        var text = cell.textContent;
        if (!HAS_DIGIT_RE.test(text) && !IN_LABEL_RE.test(text)) {
          IN_LABEL_RE.lastIndex = 0;
          continue;
        }
        IN_LABEL_RE.lastIndex = 0;
        original = text;
        cell.setAttribute('data-in-text', original);
      }
      if (unit === 'cm') {
        var converted = original.replace(/\d+(?:\.\d+)?/g, function (n) {
          return inchesToCm(parseFloat(n));
        });
        converted = converted.replace(IN_LABEL_RE, 'cm');
        cell.textContent = converted;
      } else {
        cell.textContent = original;
      }
    }
    wrap.setAttribute('data-size-chart-unit', unit);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-size-chart-unit]');
    if (!btn || btn.tagName !== 'BUTTON') return;
    var unit = btn.getAttribute('data-size-chart-unit');
    var toggle = btn.parentElement;
    if (!toggle || !toggle.classList.contains('size-chart-unit-toggle')) return;
    e.preventDefault();
    var siblings = toggle.querySelectorAll('.size-chart-unit-btn');
    for (var i = 0; i < siblings.length; i++) {
      var s = siblings[i];
      var active = s === btn;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    var container = toggle.parentElement;
    var wrap = container ? container.querySelector('.size-chart-table-wrap') : null;
    convertNumericCells(wrap, unit);
  });

  function injectNextToOptionName(nameSpan, chartHtml) {
    if (!nameSpan || nameSpan.dataset[INJECTED_FLAG] === '1') return;
    nameSpan.dataset[INJECTED_FLAG] = '1';
    nameSpan.insertAdjacentHTML('afterend', buildTriggerHtml());

    var injected = nameSpan.nextElementSibling;
    if (!injected || !injected.classList.contains('size-chart-trigger-injected')) return;

    injected.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });

    var button = injected.querySelector('[data-size-chart-trigger]');
    if (button) {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        document.dispatchEvent(new CustomEvent('tooltip:open', {
          bubbles: true,
          detail: { context: 'size-chart', content: buildPopupContent(chartHtml) }
        }));
      });
    }
  }

  function scan(root, chartHtml) {
    var nodes = (root || document).querySelectorAll('.swatch-option-name');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (!isSizeLabelText(node.textContent)) continue;
      injectNextToOptionName(node, chartHtml);
    }
  }

  function init() {
    var chartHtml = getChartSource();
    if (!chartHtml) return;

    scan(document, chartHtml);

    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue;
          if (node.matches && node.matches('.swatch-option-name')) {
            if (isSizeLabelText(node.textContent)) injectNextToOptionName(node, chartHtml);
          } else if (node.querySelector) {
            scan(node, chartHtml);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
