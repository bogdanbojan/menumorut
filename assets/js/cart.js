/*
 * Menumorut — lightweight shopping cart (vanilla, no build step)
 *
 * Plain classic script (no ES modules, no fetch) so it works both on
 * GitHub Pages and when opening the files locally over file://. Mirrors the
 * conventions of i18n.js so the two read as one codebase.
 *
 * Responsibilities:
 *   - hold the product catalogue + delivery options + Stripe config
 *   - persist the cart in localStorage (survives navigation/reloads)
 *   - keep every nav badge (.cart-count) in sync
 *   - render the cart page and the checkout page when their hooks are present
 *   - hand the finished order off to Stripe-hosted Checkout (client-only)
 *
 * Markup hooks (all optional; a page only needs the ones it uses):
 *   [data-cart-add="<id>"]        add-to-cart button (reads [data-cart-qty="<id>"])
 *   [data-cart-qty="<id>"]        quantity <input> read by the matching add button
 *   [data-cart-list]              container the cart line items render into
 *   [data-cart-empty]             shown when the cart is empty, hidden otherwise
 *   [data-cart-subtotal]          textContent set to the formatted subtotal
 *   [data-cart-checkout]          disabled while the cart is empty
 *   [data-checkout-summary]       read-only order summary on the checkout page
 *   [data-delivery-options]       container the delivery radios render into
 *   [data-checkout-subtotal]      / [data-checkout-deliveryfee] / [data-checkout-total]
 *   [data-checkout-pay]           pay button -> Stripe redirect
 *   [data-cart-clear-on-load]     empties the cart on load (success page)
 *
 * Stripe note: this uses the client-only `redirectToCheckout({ lineItems })`
 * flow, which needs only the publishable key — no backend, GitHub Pages-safe.
 * Enable "client-only integration" in the Stripe Dashboard (Checkout settings)
 * and create one Price per wine + one Price per paid delivery option.
 */
(function () {
    'use strict';

    /* =====================================================================
     * CONFIG — replace the REPLACE_ME_* placeholders with real Stripe values.
     * ===================================================================== */

    var CONFIG = {
        // Publishable key (safe to expose in client code).
        stripePublishableKey: 'REPLACE_ME_pk_live_or_test_key',

        // ISO 4217 currency used for display AND for the Stripe session.
        // NOTE: the shop currently shows "$"; confirm EUR/RON for the estate
        // and keep this in sync with the Prices created in Stripe.
        currency: 'USD',

        // Where Stripe returns the customer after paying / cancelling.
        successUrl: 'success.html',
        cancelUrl: 'checkout.html',

        // Countries the shop ships to (shown when a non-pickup option is chosen).
        shipsTo: ['RO', 'HU']
    };

    var STORAGE_KEY = 'menumorut.cart';
    var DELIVERY_KEY = 'menumorut.delivery';

    // Single source of truth for products. `priceCents` is the display price;
    // `stripePrice` is the Stripe Price ID that actually gets charged.
    var PRODUCTS = [
        { id: 'red', nameKey: 'shop.red.name', priceCents: 5000, image: 'assets/images/wine-red.jpg', stripePrice: 'REPLACE_ME_price_red' },
        { id: 'white', nameKey: 'shop.white.name', priceCents: 5000, image: 'assets/images/wine-white.jpg', stripePrice: 'REPLACE_ME_price_white' },
        { id: 'rose', nameKey: 'shop.rose.name', priceCents: 5000, image: 'assets/images/wine-rose.jpg', stripePrice: 'REPLACE_ME_price_rose' }
    ];

    // Delivery options. `pickup` is free and has no Stripe Price; paid options
    // reference a Stripe Price added as an extra line item at checkout.
    var DELIVERY = [
        { id: 'pickup', labelKey: 'checkout.delivery.pickup', priceCents: 0, stripePrice: null },
        { id: 'standard', labelKey: 'checkout.delivery.standard', priceCents: 1500, stripePrice: 'REPLACE_ME_price_delivery_standard' },
        { id: 'express', labelKey: 'checkout.delivery.express', priceCents: 3000, stripePrice: 'REPLACE_ME_price_delivery_express' }
    ];

    var DEFAULT_DELIVERY = 'pickup';

    /* ----------------------------------------------------------- storage ----
     * Two layers so the cart survives page-to-page navigation everywhere:
     *   1) localStorage   — the norm on any http(s) origin (e.g. GitHub Pages).
     *   2) window.name     — a fallback that persists across same-tab
     *                        navigations even when localStorage is isolated or
     *                        blocked, which is what happens when the site is
     *                        opened straight from disk over file:// (Firefox /
     *                        Safari give each file its own, empty store).
     * Reads prefer localStorage and fall back to window.name; writes mirror to
     * both so whichever layer is available on the next page still has the data.
     */

    var WINDOW_NAME_PREFIX = 'MENUMORUT::';

    function readWindowNameBlob() {
        try {
            var n = window.name || '';
            if (n.indexOf(WINDOW_NAME_PREFIX) !== 0) return {};
            return JSON.parse(n.slice(WINDOW_NAME_PREFIX.length)) || {};
        } catch (e) { return {}; }
    }

    function writeWindowNameBlob(blob) {
        try { window.name = WINDOW_NAME_PREFIX + JSON.stringify(blob); } catch (e) { /* no-op */ }
    }

    function storageGet(key) {
        try {
            var v = localStorage.getItem(key);
            if (v !== null && v !== undefined) return v;
        } catch (e) { /* fall through */ }
        var blob = readWindowNameBlob();
        return (key in blob) ? blob[key] : null;
    }

    function storageSet(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* private mode / file:// */ }
        var blob = readWindowNameBlob();
        blob[key] = value;
        writeWindowNameBlob(blob);
    }

    /* ----------------------------------------------------------- state I/O */

    function readState() {
        try {
            var raw = storageGet(STORAGE_KEY);
            var obj = raw ? JSON.parse(raw) : {};
            return sanitize(obj);
        } catch (e) {
            return {};
        }
    }

    // Keep only known products with a positive integer quantity.
    function sanitize(obj) {
        var clean = {};
        PRODUCTS.forEach(function (p) {
            var q = Math.floor(Number(obj && obj[p.id]) || 0);
            if (q > 0) clean[p.id] = q;
        });
        return clean;
    }

    function writeState(state) {
        storageSet(STORAGE_KEY, JSON.stringify(state));
        emitChange();
    }

    function readDelivery() {
        var id = storageGet(DELIVERY_KEY);
        return findDelivery(id) ? id : DEFAULT_DELIVERY;
    }

    function writeDelivery(id) {
        if (!findDelivery(id)) id = DEFAULT_DELIVERY;
        storageSet(DELIVERY_KEY, id);
        emitChange();
    }

    /* -------------------------------------------------------------- lookups */

    function findProduct(id) {
        for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
        return null;
    }

    function findDelivery(id) {
        for (var i = 0; i < DELIVERY.length; i++) if (DELIVERY[i].id === id) return DELIVERY[i];
        return null;
    }

    /* ------------------------------------------------------------- mutators */

    function add(id, qty) {
        var p = findProduct(id);
        if (!p) return;
        var state = readState();
        state[id] = (state[id] || 0) + Math.max(1, Math.floor(Number(qty) || 1));
        writeState(state);
    }

    function setQty(id, qty) {
        if (!findProduct(id)) return;
        var state = readState();
        var q = Math.floor(Number(qty) || 0);
        if (q > 0) state[id] = q; else delete state[id];
        writeState(state);
    }

    function remove(id) {
        var state = readState();
        delete state[id];
        writeState(state);
    }

    function clear() {
        writeState({});
    }

    /* -------------------------------------------------------------- derived */

    function count() {
        var state = readState(), n = 0;
        for (var id in state) if (state.hasOwnProperty(id)) n += state[id];
        return n;
    }

    function items() {
        var state = readState();
        return PRODUCTS.filter(function (p) { return state[p.id] > 0; })
            .map(function (p) {
                var qty = state[p.id];
                return { product: p, qty: qty, lineCents: p.priceCents * qty };
            });
    }

    function subtotalCents() {
        return items().reduce(function (sum, it) { return sum + it.lineCents; }, 0);
    }

    function deliveryOption() {
        return findDelivery(readDelivery()) || DELIVERY[0];
    }

    function deliveryCents() {
        return deliveryOption().priceCents;
    }

    function totalCents() {
        return subtotalCents() + deliveryCents();
    }

    /* ------------------------------------------------------------- helpers */

    function t(key, fallback) {
        var api = window.MenumorutI18N;
        if (api && typeof api.translate === 'function') {
            var v = api.translate(api.current, key);
            if (v !== null && v !== undefined) return v;
        }
        return fallback !== undefined ? fallback : key;
    }

    function productName(p) {
        return t(p.nameKey, p.id);
    }

    function formatMoney(cents) {
        var amount = (Number(cents) || 0) / 100;
        try {
            return new Intl.NumberFormat('en', { style: 'currency', currency: CONFIG.currency }).format(amount);
        } catch (e) {
            return CONFIG.currency + ' ' + amount.toFixed(2);
        }
    }

    function absUrl(path) {
        try { return new URL(path, location.href).href; } catch (e) { return path; }
    }

    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        if (attrs) Object.keys(attrs).forEach(function (k) {
            if (k === 'class') node.className = attrs[k];
            else if (k === 'text') node.textContent = attrs[k];
            else node.setAttribute(k, attrs[k]);
        });
        (children || []).forEach(function (c) { if (c) node.appendChild(c); });
        return node;
    }

    /* --------------------------------------------------------- change bus */

    var listeners = [];

    function onChange(cb) { if (typeof cb === 'function') listeners.push(cb); }

    function emitChange() {
        syncBadges();
        listeners.forEach(function (cb) { try { cb(); } catch (e) { /* keep going */ } });
        try { document.dispatchEvent(new CustomEvent('cart:changed')); } catch (e) { /* old browser */ }
    }

    function syncBadges() {
        var n = count();
        document.querySelectorAll('.cart-count').forEach(function (badge) {
            badge.textContent = String(n);
        });
    }

    /* ------------------------------------------------------- add-to-cart UI */

    // Delegated so it works for any current/future [data-cart-add] button.
    function bindAddButtons() {
        document.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-cart-add]');
            if (!btn) return;
            e.preventDefault();
            var id = btn.getAttribute('data-cart-add');
            var input = document.querySelector('[data-cart-qty="' + id + '"]');
            var qty = input ? Number(input.value) : 1;
            add(id, qty);
            flashAdded(btn);
        });
    }

    function flashAdded(btn) {
        if (btn.dataset.flashing) return;
        var original = btn.textContent;
        btn.dataset.flashing = '1';
        btn.textContent = t('cart.added', 'Added \u2713');
        setTimeout(function () {
            btn.textContent = original;
            delete btn.dataset.flashing;
        }, 1200);
    }

    /* ----------------------------------------------------------- cart page */

    function renderCartPage() {
        var list = document.querySelector('[data-cart-list]');
        if (!list) return;

        var empty = document.querySelector('[data-cart-empty]');
        var body = document.querySelector('[data-cart-body]');
        var checkoutBtn = document.querySelector('[data-cart-checkout]');
        var data = items();
        var isEmpty = data.length === 0;

        list.textContent = '';
        if (empty) empty.hidden = !isEmpty;
        if (body) body.hidden = isEmpty;
        if (checkoutBtn) {
            checkoutBtn.classList.toggle('is-disabled', isEmpty);
            checkoutBtn.setAttribute('aria-disabled', isEmpty ? 'true' : 'false');
        }

        data.forEach(function (it) {
            list.appendChild(cartRow(it));
        });

        var subtotal = document.querySelector('[data-cart-subtotal]');
        if (subtotal) subtotal.textContent = formatMoney(subtotalCents());
    }

    function cartRow(it) {
        var p = it.product;

        var img = el('div', { class: 'cart-row-media' }, [
            el('img', { src: p.image, alt: productName(p) })
        ]);

        var stepper = el('div', { class: 'qty-stepper' }, [
            el('button', { type: 'button', class: 'qty-btn', 'data-cart-dec': p.id, 'aria-label': t('cart.decrease', 'Decrease quantity') }, [document.createTextNode('\u2212')]),
            (function () {
                var input = el('input', { type: 'number', class: 'qty-input', min: '1', value: String(it.qty), 'data-cart-set': p.id, 'aria-label': t('cart.quantity', 'Quantity') });
                return input;
            })(),
            el('button', { type: 'button', class: 'qty-btn', 'data-cart-inc': p.id, 'aria-label': t('cart.increase', 'Increase quantity') }, [document.createTextNode('+')])
        ]);

        var info = el('div', { class: 'cart-row-info' }, [
            el('h3', { class: 'cart-row-name', text: productName(p) }),
            el('p', { class: 'cart-row-unit', text: formatMoney(p.priceCents) }),
            stepper,
            el('button', { type: 'button', class: 'cart-row-remove', 'data-cart-remove': p.id, text: t('cart.remove', 'Remove') })
        ]);

        var line = el('div', { class: 'cart-row-line', text: formatMoney(it.lineCents) });

        return el('div', { class: 'cart-row' }, [img, info, line]);
    }

    // Delegated handlers for the cart page controls.
    function bindCartControls() {
        document.addEventListener('click', function (e) {
            var inc = e.target.closest('[data-cart-inc]');
            if (inc) { var id = inc.getAttribute('data-cart-inc'); setQty(id, (readState()[id] || 0) + 1); return; }

            var dec = e.target.closest('[data-cart-dec]');
            if (dec) { var d = dec.getAttribute('data-cart-dec'); setQty(d, (readState()[d] || 0) - 1); return; }

            var rm = e.target.closest('[data-cart-remove]');
            if (rm) { remove(rm.getAttribute('data-cart-remove')); return; }
        });

        document.addEventListener('change', function (e) {
            var set = e.target.closest('[data-cart-set]');
            if (set) setQty(set.getAttribute('data-cart-set'), set.value);
        });
    }

    /* ------------------------------------------------------- checkout page */

    function renderCheckoutPage() {
        var summary = document.querySelector('[data-checkout-summary]');
        var optionsHost = document.querySelector('[data-delivery-options]');
        if (!summary && !optionsHost) return;

        var data = items();

        if (summary) {
            summary.textContent = '';
            if (!data.length) {
                summary.appendChild(el('p', { class: 'checkout-empty', text: t('checkout.empty', 'Your cart is empty.') }));
            } else {
                data.forEach(function (it) {
                    summary.appendChild(el('div', { class: 'summary-row' }, [
                        el('span', { class: 'summary-name', text: productName(it.product) + ' \u00d7 ' + it.qty }),
                        el('span', { class: 'summary-amount', text: formatMoney(it.lineCents) })
                    ]));
                });
            }
        }

        if (optionsHost && !optionsHost.dataset.built) {
            buildDeliveryOptions(optionsHost);
            optionsHost.dataset.built = '1';
        }
        syncDeliverySelection();
        renderCheckoutTotals();

        var pay = document.querySelector('[data-checkout-pay]');
        if (pay) {
            pay.disabled = data.length === 0;
        }
    }

    function buildDeliveryOptions(host) {
        host.textContent = '';
        DELIVERY.forEach(function (d) {
            var input = el('input', { type: 'radio', name: 'delivery', value: d.id, id: 'delivery-' + d.id });
            var label = el('label', { class: 'delivery-option', for: 'delivery-' + d.id }, [
                input,
                el('span', { class: 'delivery-name', text: t(d.labelKey, d.id) }),
                el('span', { class: 'delivery-price', text: d.priceCents ? formatMoney(d.priceCents) : t('checkout.delivery.free', 'Free') })
            ]);
            host.appendChild(label);
        });

        host.addEventListener('change', function (e) {
            var radio = e.target.closest('input[name="delivery"]');
            if (radio) { writeDelivery(radio.value); renderCheckoutTotals(); }
        });
    }

    function syncDeliverySelection() {
        var current = readDelivery();
        document.querySelectorAll('input[name="delivery"]').forEach(function (radio) {
            radio.checked = radio.value === current;
        });
    }

    function renderCheckoutTotals() {
        var sub = document.querySelector('[data-checkout-subtotal]');
        var fee = document.querySelector('[data-checkout-deliveryfee]');
        var total = document.querySelector('[data-checkout-total]');
        if (sub) sub.textContent = formatMoney(subtotalCents());
        if (fee) fee.textContent = deliveryCents() ? formatMoney(deliveryCents()) : t('checkout.delivery.free', 'Free');
        if (total) total.textContent = formatMoney(totalCents());
    }

    function bindCheckout() {
        var pay = document.querySelector('[data-checkout-pay]');
        if (pay) pay.addEventListener('click', function (e) { e.preventDefault(); checkout(pay); });
    }

    /* --------------------------------------------------------- Stripe pay */

    function checkout(button) {
        var data = items();
        if (!data.length) return;

        var pk = CONFIG.stripePublishableKey;
        if (!pk || pk.indexOf('REPLACE_ME') === 0) {
            alert(t('checkout.notConfigured',
                'Payments are not configured yet. Add your Stripe publishable key and Price IDs in assets/js/cart.js.'));
            return;
        }
        if (typeof window.Stripe !== 'function') {
            alert(t('checkout.stripeUnavailable', 'Could not reach Stripe. Please try again.'));
            return;
        }

        var missing = data.some(function (it) {
            return !it.product.stripePrice || it.product.stripePrice.indexOf('REPLACE_ME') === 0;
        });
        var delivery = deliveryOption();
        if (delivery.priceCents > 0 && (!delivery.stripePrice || delivery.stripePrice.indexOf('REPLACE_ME') === 0)) missing = true;
        if (missing) {
            alert(t('checkout.notConfigured',
                'Payments are not configured yet. Add your Stripe publishable key and Price IDs in assets/js/cart.js.'));
            return;
        }

        var lineItems = data.map(function (it) {
            return { price: it.product.stripePrice, quantity: it.qty };
        });
        if (delivery.stripePrice) lineItems.push({ price: delivery.stripePrice, quantity: 1 });

        if (button) button.disabled = true;

        var stripe = window.Stripe(pk);
        var opts = {
            lineItems: lineItems,
            mode: 'payment',
            successUrl: absUrl(CONFIG.successUrl),
            cancelUrl: absUrl(CONFIG.cancelUrl)
        };
        if (delivery.id !== 'pickup' && CONFIG.shipsTo && CONFIG.shipsTo.length) {
            opts.shippingAddressCollection = { allowedCountries: CONFIG.shipsTo };
        }

        stripe.redirectToCheckout(opts).then(function (res) {
            if (res && res.error) {
                if (button) button.disabled = false;
                alert(res.error.message || t('checkout.error', 'Something went wrong starting checkout.'));
            }
        });
    }

    /* ------------------------------------------------------------------ init */

    function init() {
        // Success page (or any page) can request a reset after fulfilment.
        if (document.querySelector('[data-cart-clear-on-load]')) clear();

        bindAddButtons();
        bindCartControls();
        bindCheckout();

        syncBadges();
        renderCartPage();
        renderCheckoutPage();

        // Re-render dynamic copy when the language changes, and totals/rows
        // when the cart changes elsewhere (e.g. another tab is out of scope,
        // but in-page mutations route through emitChange()).
        document.addEventListener('i18n:changed', function () {
            renderCartPage();
            renderCheckoutPage();
        });
        onChange(function () {
            renderCartPage();
            renderCheckoutPage();
        });
    }

    /* --------------------------------------------------------------- exports */

    window.MenumorutCart = {
        config: CONFIG,
        products: PRODUCTS,
        delivery: DELIVERY,
        add: add,
        setQty: setQty,
        remove: remove,
        clear: clear,
        count: count,
        items: items,
        subtotalCents: subtotalCents,
        deliveryOption: deliveryOption,
        setDelivery: writeDelivery,
        totalCents: totalCents,
        formatMoney: formatMoney,
        onChange: onChange,
        checkout: checkout
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
