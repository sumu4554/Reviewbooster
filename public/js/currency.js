function formatINR(amount) {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

function formatINRPlain(amount) {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(num);
}

function billingPeriodLabel(period) {
  if (period === 'yearly') return '/year';
  if (period === 'one-time') return ' one-time';
  return '/month';
}

function renderPricingAmount(price, period = 'monthly') {
  const formatted = formatINRPlain(price);
  return `
    <div class="pricing-price">
      <span class="pricing-currency">₹</span>
      <span class="pricing-amount">${formatted}</span>
      <span class="pricing-period">${billingPeriodLabel(period)}</span>
    </div>`;
}

window.formatINR = formatINR;
window.formatINRPlain = formatINRPlain;
window.billingPeriodLabel = billingPeriodLabel;
window.renderPricingAmount = renderPricingAmount;
