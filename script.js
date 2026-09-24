(() => {
  'use strict';

  // Per-charge costs transcribed from the supplied tables, in charge order.
  const prices = {
    king: {
      regular: [30, 30, 30, 50, 50, 70, 70, 70, 100, 100, 100, 150, 150, 150, 200],
      discounted: [18, 18, 18, 30, 30, 42, 42, 42, 60, 60, 60, 90, 90, 90, 120]
    },
    star: {
      regular: [30, 60, 100, 150, 210],
      discounted: [18, 36, 60, 90, 126]
    }
  };
  const format = new Intl.NumberFormat('ko-KR');
  const app = document.getElementById('app');
  const comparisonToggle = document.getElementById('comparison-mode');
  const firstPanel = document.getElementById('calculator-a');
  const secondPanel = firstPanel.cloneNode(true);

  // Keep both panels mounted, with unique labels and independent input state.
  secondPanel.id = 'calculator-b';
  secondPanel.hidden = true;
  for (const element of secondPanel.querySelectorAll('[id]')) element.id = 'b-' + element.id;
  for (const element of [secondPanel, ...secondPanel.querySelectorAll('*')]) {
    for (const attribute of ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls']) {
      if (element.hasAttribute(attribute)) {
        element.setAttribute(attribute, element.getAttribute(attribute).split(/\s+/).map(id => 'b-' + id).join(' '));
      }
    }
    if (element.hasAttribute('name')) element.setAttribute('name', 'b-' + element.getAttribute('name'));
  }
  secondPanel.querySelector('.calculator-title').textContent = '계산 2';
  document.getElementById('calculators').append(secondPanel);
  let calculators;

  function updateDifferences() {
    if (!calculators) return;
    const left = calculators.a.getState();
    const right = calculators.b.getState();
    for (const kind of ['king', 'star', 'total']) {
      const note = document.getElementById('b-' + kind + '-difference');
      const difference = left[kind] === null || right[kind] === null ? null : right[kind].cost - left[kind].cost;
      const visible = comparisonToggle.checked && difference !== null && difference !== 0;
      note.hidden = !visible;
      note.textContent = visible ? ' (' + (difference > 0 ? '+' : '-') + format.format(Math.abs(difference)) + ')' : '';
      note.setAttribute('data-direction', visible ? difference > 0 ? 'increase' : 'decrease' : '');
    }
  }

  function isValidCount(count, max) {
    return Number.isInteger(count) && count >= 0 && count <= max;
  }

  function calculate(kind, count, discountApplied) {
    if (count === null) return null;
    const sum = list => list.slice(0, count).reduce((total, cost) => total + cost, 0);
    const regular = sum(prices[kind].regular);
    const discounted = sum(prices[kind].discounted);
    return {
      count,
      regular,
      discounted,
      discount_applied: discountApplied,
      cost: discountApplied ? discounted : regular
    };
  }

  function createCalculator(panel, prefix) {
    const find = id => panel.querySelector('#' + prefix + id);
    const inputs = { king: find('king-count'), star: find('star-count') };
    const discounts = { king: find('king-discount'), star: find('star-discount') };
    const steppers = {
      king: { increase: find('king-increase'), decrease: find('king-decrease') },
      star: { increase: find('star-increase'), decrease: find('star-decrease') }
    };
    let state;

    function readCount(kind) {
      const input = inputs[kind];
      const max = prices[kind].regular.length;
      const raw = input.value.trim();
      const count = raw === '' ? 0 : Number(raw);
      const valid = !input.validity.badInput &&
        (raw === '' || /^\d+$/.test(raw)) && isValidCount(count, max);
      const error = find(kind + '-error');
      input.setAttribute('aria-invalid', String(!valid));
      error.textContent = valid ? '' : '0~' + max + ' 사이의 정수를 입력해 주세요.';
      error.hidden = valid;
      return valid ? count : null;
    }

    function display(kind, result, discountLabel) {
      find(kind + '-cost').textContent = result === null ? '—' : format.format(result.cost);
      const note = find(kind + '-discount-note');
      note.textContent = discountLabel ? ' (' + discountLabel + ')' : '';
      note.hidden = !discountLabel;
    }

    function update() {
      const kingDiscount = discounts.king.checked;
      const starDiscount = discounts.star.checked;
      const king = calculate('king', readCount('king'), kingDiscount);
      const star = calculate('star', readCount('star'), starDiscount);
      for (const [kind, result] of Object.entries({ king, star })) {
        steppers[kind].increase.disabled = result === null || result.count >= prices[kind].regular.length;
        steppers[kind].decrease.disabled = result === null || result.count <= 0;
      }
      const discountStatus = kingDiscount && starDiscount ? 'all' : kingDiscount || starDiscount ? 'partial' : 'none';
      const total = king === null || star === null ? null : {
        regular: king.regular + star.regular,
        discounted: king.discounted + star.discounted,
        cost: king.cost + star.cost,
        discount_status: discountStatus
      };
      display('king', king, kingDiscount ? '할인 적용' : '');
      display('star', star, starDiscount ? '할인 적용' : '');
      display('total', total, discountStatus === 'all' ? '할인 적용' : discountStatus === 'partial' ? '일부 할인 적용' : '');
      state = { king, star, total, discounts: { king: kingDiscount, star: starDiscount } };
      updateDifferences();
      return state;
    }

    function changeCount(kind, amount) {
      const count = readCount(kind);
      if (count === null) return;
      inputs[kind].value = String(Math.max(0, Math.min(prices[kind].regular.length, count + amount)));
      update();
    }

    for (const kind of Object.keys(steppers)) {
      steppers[kind].increase.addEventListener('click', () => changeCount(kind, 1));
      steppers[kind].decrease.addEventListener('click', () => changeCount(kind, -1));
    }
    for (const input of Object.values(inputs)) input.addEventListener('input', update);
    for (const discount of Object.values(discounts)) discount.addEventListener('change', update);
    update();
    return {
      getState: () => state,
      setCounts(king, star, kingDiscount, starDiscount) {
        inputs.king.value = String(king);
        inputs.star.value = String(star);
        if (kingDiscount !== undefined) discounts.king.checked = kingDiscount;
        if (starDiscount !== undefined) discounts.star.checked = starDiscount;
        return update();
      }
    };
  }

  calculators = {
    a: createCalculator(firstPanel, ''),
    b: createCalculator(secondPanel, 'b-')
  };

  function setComparisonMode(enabled) {
    comparisonToggle.checked = enabled;
    app.classList.toggle('is-comparing', enabled);
    secondPanel.hidden = !enabled;
    updateDifferences();
    return { enabled, a: calculators.a.getState(), b: calculators.b.getState() };
  }
  comparisonToggle.addEventListener('change', () => setComparisonMode(comparisonToggle.checked));
  setComparisonMode(comparisonToggle.checked);
  comparisonToggle.disabled = false;

  // Optional browser integration. The calculator needs no supporting service.
  const context = document.modelContext;
  if (context && typeof context.registerTool === 'function') {
    const lifecycle = new AbortController();
    window.addEventListener('pagehide', event => {
      if (!event.persisted) lifecycle.abort();
    }, { signal: lifecycle.signal });
    try {
      Promise.resolve(context.registerTool({
        name: 'set_candy_charge_counts',
        title: '사탕 충전 비용 계산',
        description: '지정한 계산기의 충전 횟수와 할인 선택을 반영하고 표시 비용(cost) 및 합계를 계산합니다. 할인 선택을 생략하면 현재 선택을 유지합니다. 기본 대상은 첫 계산기(a)이며 두 번째(b)를 지정하면 비교 모드도 켭니다.',
        inputSchema: {
          type: 'object',
          properties: {
            calculator: { type: 'string', enum: ['a', 'b'] },
            king_count: { type: 'integer', minimum: 0, maximum: 15 },
            star_count: { type: 'integer', minimum: 0, maximum: 5 },
            king_discount: { type: 'boolean' },
            star_discount: { type: 'boolean' }
          },
          required: ['king_count', 'star_count'],
          additionalProperties: false
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          if (!input || typeof input !== 'object' || Array.isArray(input) ||
              Object.keys(input).some(key => !['calculator', 'king_count', 'star_count', 'king_discount', 'star_discount'].includes(key)) ||
              (input.calculator !== undefined && !['a', 'b'].includes(input.calculator)) ||
              (input.king_discount !== undefined && typeof input.king_discount !== 'boolean') ||
              (input.star_discount !== undefined && typeof input.star_discount !== 'boolean') ||
              !isValidCount(input.king_count, 15) || !isValidCount(input.star_count, 5)) {
            throw new Error('왕사탕은 0~15, 별사탕은 0~5 사이의 정수이고, 할인 선택은 true 또는 false여야 합니다.');
          }
          const target = input.calculator || 'a';
          if (target === 'b') setComparisonMode(true);
          return calculators[target].setCounts(input.king_count, input.star_count, input.king_discount, input.star_discount);
        }
      }, { signal: lifecycle.signal })).catch(() => {});
      Promise.resolve(context.registerTool({
        name: 'set_candy_comparison_mode',
        title: '사탕 비교 모드 설정',
        description: '비교 모드를 켜거나 끕니다. 두 계산기의 입력값과 할인 선택은 유지됩니다.',
        inputSchema: {
          type: 'object',
          properties: { enabled: { type: 'boolean' } },
          required: ['enabled'],
          additionalProperties: false
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          if (!input || typeof input !== 'object' || Array.isArray(input) ||
              Object.keys(input).some(key => key !== 'enabled') || typeof input.enabled !== 'boolean') {
            throw new Error('enabled는 true 또는 false여야 합니다.');
          }
          return setComparisonMode(input.enabled);
        }
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch (_) { /* Calculation remains available if integration is unsupported. */ }
  }
})();
