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
  const errorMessage = document.getElementById('order-error');
  const submitButton = form.querySelector('[type="submit"]');
  let quantity = 1;
  let rewardApplied = false;

  function formatLei(amount) {
    return money.format(amount) + ' lei';
  }

  function renderTotals() {
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
    // Checkout still works when browser storage is unavailable.
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessage.hidden = true;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const order = {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      address: String(data.get('address') || '').trim(),
      city: String(data.get('city') || '').trim(),
      postal: String(data.get('postal') || '').trim(),
      quantity,
      promoCode: rewardApplied ? rewardCode : '',
      website: String(data.get('website') || ''),
      orderConsent: data.get('orderConsent') === 'on',
    };

    submitButton.disabled = true;
    submitButton.textContent = 'Sending request…';

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We couldn’t send your order request. Please try again.');

      document.getElementById('confirmation-copy').textContent =
        'Thank you, ' + order.name.split(/\s+/)[0] + '. Your total before delivery is ' + formatLei(result.totalBeforeDelivery) + '.';
      document.getElementById('order-reference').textContent = result.orderReference;
      layout.hidden = true;
      confirmation.hidden = false;
      confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      errorMessage.textContent = error.message || 'Something went wrong. Please try again.';
      errorMessage.hidden = false;
      submitButton.disabled = false;
      submitButton.innerHTML = 'Send order request <span>→</span>';
    }
  });

  renderTotals();
})();
