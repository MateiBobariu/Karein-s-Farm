(() => {
  'use strict';

  const unitPrice = 100;
  
  const rewardCode = 'HAYBALE10';
  const money = new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const quantityOutput = document.getElementById('quantity');
  const subtotalOutput = document.getElementById('subtotal');
  const discountRow = document.getElementById('discount-row');
  const discountOutput = document.getElementById('discount-amount');
  const totalOutput = document.getElementById('total');
  const promoInput = document.getElementById('promo-code');
  const promoStatus = document.getElementById('promo-status');
  const form = document.getElementById('checkout-form');
  const layout = document.getElementById('checkout-layout');
  const confirmation = document.getElementById('order-confirmation');
  let quantity = 1;
  let rewardApplied = false;

  function formatLei(amount) {\n    return money.format(amount) + ' lei';\n  }\n\n  function renderTotals() {
    const subtotal = unitPrice * quantity;
    const discount = rewardApplied ? subtotal * 0.1 : 0;
    quantityOutput.textContent = String(quantity);
    subtotalOutput.textContent = formatLei(subtotal);
    discountOutput.textContent = '−' + formatLei(discount);
    discountRow.hidden = !rewardApplied;
    totalOutput.textContent = formatLei(subtotal - discount);
  }

  function applyReward() {
    const entered = promoInput.value.trim().toUpperCase();
    if (entered === rewardCode) {
      rewardApplied = true;
      promoInput.value = rewardCode;
      promoStatus.textContent = '10% discount applied.';
      promoStatus.className = 'promo-success';
    } else {
      rewardApplied = false;
      promoStatus.textContent = entered ? 'That code isn’t recognised. Check it and try again.' : 'Enter HAYBALE10 for 10% off.';
      promoStatus.className = 'promo-error';
    }
    renderTotals();
  }

  document.getElementById('quantity-minus').addEventListener('click', () => {
    quantity = Math.max(1, quantity - 1);
    renderTotals();
  });
  document.getElementById('quantity-plus').addEventListener('click', () => {
    quantity = Math.min(10, quantity + 1);
    renderTotals();
  });
  document.getElementById('apply-promo').addEventListener('click', applyReward);
  promoInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyReward();
    }
  });

  try {
    if (localStorage.getItem('karinsFarmDetectiveDiscount') === rewardCode) {
      promoInput.value = rewardCode;
      applyReward();
    }
  } catch (error) {
    // The checkout preview works when browser storage is unavailable.
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const firstName = form.elements.name.value.trim().split(/\s+/)[0] || 'detective';
    document.getElementById('confirmation-copy').textContent = 'Thanks, ' + firstName + '! Your total before delivery is ' + totalOutput.textContent + '.';
    document.getElementById('order-reference').textContent = 'KF-PREVIEW-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    layout.hidden = true;
    confirmation.hidden = false;
    confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  renderTotals();
})();
