function getNavbarHTML(activePage = '', options = {}) {
  const isHome = options.isHome || activePage === 'home';
  const pages = [
    { href: '/', label: 'Home', id: 'home' },
    { href: isHome ? '/#services' : '/#services', label: 'Services', id: 'services' },
    { href: '/services.html', label: 'About', id: 'services-page' },
    { href: isHome ? '/#pricing' : '/#pricing', label: 'Pricing', id: 'pricing' },
    { href: '/contact.html', label: 'Contact', id: 'contact' },
  ];

  const links = pages
    .map((p) => `<a href="${p.href}" class="${activePage === p.id ? 'active' : ''}">${p.label}</a>`)
    .join('');

  const mobileLinks = pages
    .map((p) => `<a href="${p.href}">${p.label}</a>`)
    .join('');

  const topbar = `
    <div class="topbar">
      <div class="container topbar-inner">
        <div class="topbar-left">
          <span class="topbar-item">
            <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
            +91 98765 43210
          </span>
          <span class="topbar-item">
            <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            hello@reviewboost.in
          </span>
          <span class="topbar-item">
            <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Bengaluru, India
          </span>
        </div>
        <div class="topbar-social">
          <a href="#" aria-label="Facebook">FB</a>
          <a href="#" aria-label="LinkedIn">IN</a>
          <a href="#" aria-label="Instagram">IG</a>
          <a href="#" aria-label="Twitter">X</a>
        </div>
      </div>
    </div>`;

  const navClass = 'navbar navbar-light';

  return `
    <header class="site-header has-topbar">
      ${topbar}
      <nav class="${navClass}" id="main-navbar">
        <div class="container navbar-inner">
          <a href="/" class="navbar-logo">
            <div class="logo-icon">★</div>
            ReviewBoost
          </a>
          <div class="navbar-links">${links}</div>
          <div class="navbar-actions">
            <a href="/contact.html" class="btn btn-ghost btn-sm">Contact Us</a>
            <a href="${isHome ? '/#contact' : '/contact.html'}" class="btn btn-primary btn-sm">Get Started</a>
            <button class="nav-toggle" aria-label="Toggle menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
        <div class="mobile-menu">${mobileLinks}</div>
      </nav>
    </header>`;
}

function getFooterHTML() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="/" class="navbar-logo">
              <div class="logo-icon">★</div>
              ReviewBoost
            </a>
            <p>Customer engagement & reputation management services that help local businesses build trust and grow through authentic Google reviews.</p>
          </div>
          <div class="footer-col">
            <h4>Services</h4>
            <ul>
              <li><a href="/services.html">Review Promotion</a></li>
              <li><a href="/services.html">Reputation Management</a></li>
              <li><a href="/services.html">Review Campaigns</a></li>
              <li><a href="/services.html">Local SEO Boost</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="/#how-it-works">How It Works</a></li>
              <li><a href="/#pricing">Pricing</a></li>
              <li><a href="/#faq">FAQ</a></li>
              <li><a href="/#faq">FAQ</a></li>
              <li><a href="/contact.html">Contact</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@reviewboost.in">hello@reviewboost.in</a></li>
              <li><a href="tel:+919876543210">+91 98765 43210</a></li>
              <li><a href="https://wa.me/919876543210" target="_blank" rel="noopener">WhatsApp Support</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${new Date().getFullYear()} ReviewBoost. All rights reserved.</span>
          <span>Customer engagement & reputation management services</span>
        </div>
      </div>
    </footer>`;
}

function getWhatsAppButton() {
  return `
    <a href="https://wa.me/919876543210?text=Hi%20ReviewBoost%2C%20I%27d%20like%20to%20learn%20more%20about%20your%20reputation%20management%20services." 
       class="whatsapp-float" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>`;
}

function getBackgroundEffects() {
  return `
    <div class="bg-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>
    <div class="grid-overlay"></div>`;
}

function injectLayout(activePage = '', options = {}) {
  const navPlaceholder = document.getElementById('navbar-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');
  const bgPlaceholder = document.getElementById('bg-placeholder');
  const whatsappPlaceholder = document.getElementById('whatsapp-placeholder');

  const isHome = options.isHome || activePage === 'home';
  if (isHome) document.body.classList.add('home-page');

  if (navPlaceholder) navPlaceholder.outerHTML = getNavbarHTML(activePage, { isHome });
  if (footerPlaceholder) footerPlaceholder.outerHTML = getFooterHTML();
  if (bgPlaceholder) bgPlaceholder.innerHTML = '';
  if (whatsappPlaceholder) whatsappPlaceholder.outerHTML = getWhatsAppButton();
}

window.injectLayout = injectLayout;
