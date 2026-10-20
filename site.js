document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
if (menuButton && mainNav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mainNav.classList.toggle('nav-open', !open);
  });
}

/*
 * Analytics configuration. Add the IDs from your Google Analytics web stream
 * and Microsoft Clarity project to enable tracking after visitor consent.
 */
const analyticsConfig = {
  ga4MeasurementId: '',
  clarityProjectId: '',
};

const consentKey = 'karinsFarmAnalyticsConsent';

function loadAnalytics() {
  const { ga4MeasurementId, clarityProjectId } = analyticsConfig;
  if (localStorage.getItem(consentKey) !== 'accepted') return;

  if (/^G-[A-Z0-9]+$/i.test(ga4MeasurementId) && !window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ga4MeasurementId, { anonymize_ip: true });
    const googleTag = document.createElement('script');
    googleTag.async = true;
    googleTag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga4MeasurementId);
    document.head.appendChild(googleTag);
  }

  if (/^[a-z0-9]+$/i.test(clarityProjectId) && !window.clarity) {
    window.clarity = function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    const clarityTag = document.createElement('script');
    clarityTag.async = true;
    clarityTag.src = 'https://www.clarity.ms/tag/' + encodeURIComponent(clarityProjectId);
    document.head.appendChild(clarityTag);
  }
}

function addAnalyticsConsent() {
  const footer = document.querySelector('.site-footer');
  if (footer && !document.querySelector('[data-privacy-settings]')) {
    const settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'privacy-settings';
    settings.dataset.privacySettings = '';
    settings.textContent = 'Privacy settings';
    settings.addEventListener('click', () => {
      banner.hidden = false;
      banner.focus();
    });
    footer.appendChild(settings);
  }

  const banner = document.createElement('section');
  banner.className = 'privacy-banner';
  banner.setAttribute('aria-label', 'Analytics privacy choices');
  banner.setAttribute('aria-live', 'polite');
  banner.tabIndex = -1;
  banner.hidden = true;
  banner.innerHTML = `
    <div class="privacy-banner-copy">
      <strong>Help us improve Karin’s Farm</strong>
      <p>Google Analytics and Microsoft Clarity help us understand site visits and how pages are used. They load only if you accept. You can change your choice any time in Privacy settings.</p>
    </div>
    <div class="privacy-banner-actions">
      <button type="button" class="privacy-accept">Accept analytics</button>
      <button type="button" class="privacy-reject">Reject</button>
    </div>`;
  document.body.appendChild(banner);

  banner.querySelector('.privacy-accept').addEventListener('click', () => {
    localStorage.setItem(consentKey, 'accepted');
    banner.hidden = true;
    loadAnalytics();
  });
  banner.querySelector('.privacy-reject').addEventListener('click', () => {
    localStorage.setItem(consentKey, 'rejected');
    banner.hidden = true;
  });

  if (!['accepted', 'rejected'].includes(localStorage.getItem(consentKey))) {
    banner.hidden = false;
  }
  loadAnalytics();
}

addAnalyticsConsent();
