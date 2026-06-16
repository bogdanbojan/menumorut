/*
 * Menumorut — lightweight i18n engine (en / ro / hu)
 *
 * Plain classic script (no ES modules, no fetch) so it works both on
 * GitHub Pages and when opening the files locally over file://.
 *
 * Markup contract:
 *   <el data-i18n="key">            -> textContent is replaced
 *   <el data-i18n-attr="attr:key">  -> attribute is set (comma-separate pairs)
 *   <button data-lang-switch="ro">  -> language switch control
 *
 * Resolution order on load: ?lang= URL param  ->  localStorage  ->  default (en).
 * The English text stays in the HTML as the fallback, so a missing key or a
 * disabled-JS scenario degrades gracefully to English.
 */
(function () {
    'use strict';

    var DEFAULT_LANG = 'en';
    var SUPPORTED = ['en', 'ro', 'hu'];
    var STORAGE_KEY = 'menumorut.lang';

    /* ---------------------------------------------------------------- data */

    var translations = {
        en: {
            'nav.home': 'Home',
            'nav.story': 'Story',
            'nav.visit': 'Visit',
            'nav.shop': 'Shop',

            'a11y.cart': 'Cart',
            'a11y.menu': 'Menu',
            'a11y.language': 'Language',

            'home.visit': 'VISIT',
            'home.drink': 'DRINK',
            'home.shop': 'SHOP',

            'hero.story': 'STORY',
            'hero.reservation': 'MAKE A RESERVATION',
            'hero.shop': 'SHOP',

            'label.contact': 'CONTACT',
            'label.location': 'LOCATION',
            'label.hours': 'HOURS',
            'label.reserve': 'Make a Reservation',

            'hours.l1': 'Mon\u2013Wed 6\u201311',
            'hours.l2': 'Thu\u2013Sat 4\u201312',
            'hours.l3': 'Sun 3\u201310',

            'story.title': 'PRODUCING HIGH QUALITY WINES SINCE 1970.',
            'story.p1': 'Menumorut Wines is located in the town of Biharia, in the building overlooking the hills. It is here that more than 200 years ago a beautiful story began. The story of the wine cellars where, in the heart of the Crisana area and protected by gentle hills, a wine was born. That wine was then called Menumorut, in honor of the ruler of the lands where it was produced for the first time.',
            'story.p2': 'Today the Family continues the work that began more than two centuries ago: producing high quality wines meant to enrich, year after year, the history of this important cellar where modernity and tradition meet and where a great heritage of vineyards and knowledge has been passed down from parents to children generations.',
            'story.p3': 'Armed with great winemaking experience, the people here present themselves as faithful interpreters of the native vineyards and their locations, respecting them and rigorously preserving the typical qualities thanks to the vinification of the grapes that come from their own vineyards and the winemaking processes selected over many years of activity, focusing on the location and the cultivation capacities of the single vines.',
            'story.leadStaff': 'LEAD STAFF',
            'story.ownerRole': 'Owner',
            'story.recentPress': 'RECENT PRESS',
            'story.pressFeature': 'Feature',
            'story.visitBtn': 'Visit us',

            'visit.party': '2 people',
            'visit.findTable': 'Find a Table',

            'shop.red.name': 'Menumorut Red',
            'shop.red.desc': 'A substantially bold, complex and layered wine, this is juicy in feel yet firm in structured tannins. Textured and intriguing in sweet oak tones, the fruit components are weighted in cassis and black cherry, with a lasting mineral finish of crushed rock.',
            'shop.white.name': 'Menumorut White',
            'shop.white.desc': 'Flinty mineral, smoke, yellow pear, toasted hazelnut and acacia aromas follow over to the elegant medium-bodied palate along with mature yellow apple and saline. A note of chestnut honey wraps around the finish while fresh acidity keeps it balanced.',
            'shop.rose.name': 'Menumorut Ros\u00e9',
            'shop.rose.desc': 'A wild strawberry and herb aroma carries a slight balsamic edge on the nose. The palate is well rounded and juicy in feel, with delicious red cherry and strawberry flavors that are honed by bright acidity and a tangy slick of wet stone. Cherry skin astringency marks the close, extending the fruit flavors into a medium finish.',
            'shop.quantity': 'Quantity:',
            'shop.addCart': 'Add to Cart',

            'footer.madeBy': 'Made by'
        },

        ro: {
            'nav.home': 'Acas\u0103',
            'nav.story': 'Poveste',
            'nav.visit': 'Viziteaz\u0103',
            'nav.shop': 'Magazin',

            'a11y.cart': 'Co\u0219',
            'a11y.menu': 'Meniu',
            'a11y.language': 'Limb\u0103',

            'home.visit': 'VIZITEAZ\u0102',
            'home.drink': 'DEGUST\u0102',
            'home.shop': 'CUMP\u0102R\u0102',

            'hero.story': 'POVESTE',
            'hero.reservation': 'REZERV\u0102 O MAS\u0102',
            'hero.shop': 'MAGAZIN',

            'label.contact': 'CONTACT',
            'label.location': 'LOCA\u021aIE',
            'label.hours': 'PROGRAM',
            'label.reserve': 'Rezerv\u0103 o mas\u0103',

            'hours.l1': 'Lun\u2013Mie 6\u201311',
            'hours.l2': 'Joi\u2013S\u00e2m 4\u201312',
            'hours.l3': 'Dum 3\u201310',

            'story.title': 'PRODUCEM VINURI DE \u00ceNALT\u0102 CALITATE DIN 1970.',
            'story.p1': 'Menumorut Wines se afl\u0103 \u00een ora\u0219ul Biharia, \u00een cl\u0103direa care prive\u0219te spre dealuri. Aici, \u00een urm\u0103 cu peste 200 de ani, a \u00eenceput o poveste frumoas\u0103. Povestea pivni\u021belor de vin unde, \u00een inima Cri\u0219anei \u0219i ocrotit de dealuri bl\u00e2nde, s-a n\u0103scut un vin. Acel vin a fost numit Menumorut, \u00een cinstea conduc\u0103torului \u021binuturilor unde a fost produs pentru prima dat\u0103.',
            'story.p2': 'Ast\u0103zi, Familia continu\u0103 munca \u00eenceput\u0103 acum mai bine de dou\u0103 secole: producerea unor vinuri de \u00eenalt\u0103 calitate menite s\u0103 \u00eembog\u0103\u021beasc\u0103, an dup\u0103 an, istoria acestei pivni\u021be importante, unde modernitatea \u0219i tradi\u021bia se \u00eent\u00e2lnesc \u0219i unde o mo\u0219tenire bogat\u0103 de vii \u0219i cuno\u0219tin\u021be a fost transmis\u0103 din genera\u021bie \u00een genera\u021bie, de la p\u0103rin\u021bi la copii.',
            'story.p3': '\u00cenarma\u021bi cu o vast\u0103 experien\u021b\u0103 \u00een vinifica\u021bie, oamenii de aici se prezint\u0103 drept interpre\u021bi fideli ai viilor autohtone \u0219i ai locurilor lor, respect\u00e2ndu-le \u0219i p\u0103str\u00e2nd cu rigurozitate calit\u0103\u021bile tipice datorit\u0103 vinific\u0103rii strugurilor proveni\u021bi din propriile vii \u0219i a proceselor de vinifica\u021bie alese de-a lungul multor ani de activitate, cu accent pe loca\u021bie \u0219i pe capacitatea de cultivare a fiec\u0103rei vi\u021be.',
            'story.leadStaff': 'ECHIP\u0102 DE CONDUCERE',
            'story.ownerRole': 'Proprietar',
            'story.recentPress': 'PRES\u0102 RECENT\u0102',
            'story.pressFeature': 'Articol',
            'story.visitBtn': 'Viziteaz\u0103-ne',

            'visit.party': '2 persoane',
            'visit.findTable': 'Caut\u0103 o mas\u0103',

            'shop.red.name': 'Menumorut Ro\u0219u',
            'shop.red.desc': 'Un vin substan\u021bial, \u00eendr\u0103zne\u021b, complex \u0219i stratificat, suculent ca senza\u021bie, dar ferm prin taninurile structurate. Texturat \u0219i intrigant \u00een note dulci de stejar, componentele fructate se concentreaz\u0103 pe coac\u0103ze negre \u0219i cire\u0219e negre, cu un final mineral persistent de piatr\u0103 sf\u0103r\u00e2mat\u0103.',
            'shop.white.name': 'Menumorut Alb',
            'shop.white.desc': 'Arome de cremene, fum, par\u0103 galben\u0103, alun\u0103 pr\u0103jit\u0103 \u0219i salc\u00e2m se reg\u0103sesc pe palatul elegant, de corp mediu, al\u0103turi de m\u0103r galben copt \u0219i o not\u0103 s\u0103rat\u0103. O urm\u0103 de miere de castan \u00eenv\u0103luie finalul, \u00een timp ce aciditatea proasp\u0103t\u0103 \u00eel men\u021bine echilibrat.',
            'shop.rose.name': 'Menumorut Ros\u00e9',
            'shop.rose.desc': 'O arom\u0103 de fragi \u0219i ierburi aduce o u\u0219oar\u0103 nuan\u021b\u0103 balsamic\u0103 \u00een nas. Palatul este rotund \u0219i suculent, cu arome delicioase de cire\u0219e ro\u0219ii \u0219i c\u0103p\u0219uni, \u0219lefuite de o aciditate vie \u0219i o tent\u0103 mineral-acidulat\u0103 de piatr\u0103 ud\u0103. Astringen\u021ba cojii de cirea\u0219\u0103 marcheaz\u0103 finalul, prelungind aromele fructate \u00eentr-un final mediu.',
            'shop.quantity': 'Cantitate:',
            'shop.addCart': 'Adaug\u0103 \u00een co\u0219',

            'footer.madeBy': 'Realizat de'
        },

        hu: {
            'nav.home': 'Kezd\u0151lap',
            'nav.story': 'T\u00f6rt\u00e9net',
            'nav.visit': 'L\u00e1togat\u00e1s',
            'nav.shop': 'Bolt',

            'a11y.cart': 'Kos\u00e1r',
            'a11y.menu': 'Men\u00fc',
            'a11y.language': 'Nyelv',

            'home.visit': 'L\u00c1TOGASS',
            'home.drink': 'K\u00d3STOLJ',
            'home.shop': 'V\u00c1S\u00c1ROLJ',

            'hero.story': 'T\u00d6RT\u00c9NET',
            'hero.reservation': 'FOGLALJ ASZTALT',
            'hero.shop': 'BOLT',

            'label.contact': 'KAPCSOLAT',
            'label.location': 'HELYSZ\u00cdN',
            'label.hours': 'NYITVATART\u00c1S',
            'label.reserve': 'Asztalfoglal\u00e1s',

            'hours.l1': 'H\u00e9t\u2013Sze 6\u201311',
            'hours.l2': 'Cs\u00fc\u2013Szo 4\u201312',
            'hours.l3': 'Vas 3\u201310',

            'story.title': '1970 \u00d3TA KIV\u00c1L\u00d3 MIN\u0150S\u00c9G\u0170 BOROKAT K\u00c9SZ\u00cdT\u00dcNK.',
            'story.p1': 'A Menumorut Wines Bihar (Biharia) telep\u00fcl\u00e9s\u00e9n tal\u00e1lhat\u00f3, a dombokra n\u00e9z\u0151 \u00e9p\u00fcletben. Itt kezd\u0151d\u00f6tt t\u00f6bb mint 200 \u00e9vvel ezel\u0151tt egy gy\u00f6ny\u00f6r\u0171 t\u00f6rt\u00e9net. A borpinc\u00e9k t\u00f6rt\u00e9nete, ahol a K\u00f6r\u00f6svid\u00e9k (Cri\u0219ana) sz\u00edv\u00e9ben, szel\u00edd dombok oltalm\u00e1ban megsz\u00fcletett egy bor. Ezt a bort Menumorutnak nevezt\u00e9k el, annak a vid\u00e9knek az uralkod\u00f3ja tisztelet\u00e9re, ahol el\u0151sz\u00f6r k\u00e9sz\u00edtett\u00e9k.',
            'story.p2': 'A Csal\u00e1d ma is folytatja a t\u00f6bb mint k\u00e9t \u00e9vsz\u00e1zada megkezdett munk\u00e1t: kiv\u00e1l\u00f3 min\u0151s\u00e9g\u0171 borok k\u00e9sz\u00edt\u00e9s\u00e9t, amelyek \u00e9vr\u0151l \u00e9vre gazdag\u00edtj\u00e1k ennek a jelent\u0151s pinc\u00e9nek a t\u00f6rt\u00e9net\u00e9t, ahol a moderns\u00e9g \u00e9s a hagyom\u00e1ny tal\u00e1lkozik, \u00e9s ahol a sz\u0151l\u0151k \u00e9s a tud\u00e1s gazdag \u00f6r\u00f6ks\u00e9ge nemzed\u00e9kr\u0151l nemzed\u00e9kre, sz\u00fcl\u0151kr\u0151l gyermekekre sz\u00e1llt.',
            'story.p3': 'A bork\u00e9sz\u00edt\u00e9sben szerzett gazdag tapasztalattal felv\u00e9rtezve az itteniek a honos sz\u0151l\u0151k \u00e9s term\u0151helyeik h\u0171 tolm\u00e1csol\u00f3ik\u00e9nt mutatkoznak be, tisztelve azokat \u00e9s szigor\u00faan meg\u0151rizve jellegzetes tulajdons\u00e1gaikat a saj\u00e1t sz\u0151l\u0151ikb\u0151l sz\u00e1rmaz\u00f3 sz\u0151l\u0151 feldolgoz\u00e1s\u00e1nak \u00e9s a sok \u00e9v alatt kiv\u00e1lasztott bork\u00e9sz\u00edt\u00e9si elj\u00e1r\u00e1soknak k\u00f6sz\u00f6nhet\u0151en, az egyes t\u0151k\u00e9k term\u0151hely\u00e9re \u00e9s termeszt\u00e9si adotts\u00e1gaira \u00f6sszpontos\u00edtva.',
            'story.leadStaff': 'VEZET\u0150S\u00c9G',
            'story.ownerRole': 'Tulajdonos',
            'story.recentPress': 'SAJT\u00d3',
            'story.pressFeature': 'Cikk',
            'story.visitBtn': 'L\u00e1togass el',

            'visit.party': '2 f\u0151',
            'visit.findTable': 'Asztalt keresek',

            'shop.red.name': 'Menumorut V\u00f6r\u00f6s',
            'shop.red.desc': 'Tartalmas, mer\u00e9sz, \u00f6sszetett \u00e9s r\u00e9tegzett bor, \u00e9rzet\u00e9ben zamatos, m\u00e9gis feszes, struktur\u00e1lt tanninokkal. Text\u00far\u00e1s \u00e9s izgalmas, \u00e9des t\u00f6lgyf\u00e1s t\u00f3nusokkal; gy\u00fcm\u00f6lcs\u00f6s \u00f6sszetev\u0151i a feketeribizli \u00e9s a fekete cseresznye k\u00f6r\u00e9 \u00e9p\u00fclnek, tart\u00f3s, z\u00fazott k\u00f6ves \u00e1sv\u00e1nyi lecseng\u00e9ssel.',
            'shop.white.name': 'Menumorut Feh\u00e9r',
            'shop.white.desc': 'Kovak\u00f6ves \u00e1sv\u00e1nyoss\u00e1g, f\u00fcst, s\u00e1rga k\u00f6rte, p\u00edr\u00edtott mogyor\u00f3 \u00e9s ak\u00e1c arom\u00e1i k\u00eds\u00e9rik az eleg\u00e1ns, k\u00f6z\u00e9ptest\u0171 \u00edzvil\u00e1got az \u00e9rett s\u00e1rga alma \u00e9s a s\u00f3s jegyek mellett. A lecseng\u00e9st gesztenyem\u00e9z \u00f6leli k\u00f6r\u00fcl, mik\u00f6zben a friss savak egyens\u00falyban tartj\u00e1k.',
            'shop.rose.name': 'Menumorut Ros\u00e9',
            'shop.rose.desc': 'Vadeper \u00e9s gy\u00f3gyn\u00f6v\u00e9nyek arom\u00e1ja enyhe balzsamos \u00e9llel jelenik meg az illatban. Az \u00edzvil\u00e1g kerek \u00e9s zamatos, \u00ednycsikland\u00f3 piros cseresznye \u00e9s eper \u00edzekkel, amelyeket \u00e9l\u00e9nk savak \u00e9s nedves k\u0151 pik\u00e1ns jegye csiszol. A cseresznyeh\u00e9j fanyars\u00e1ga z\u00e1rja a kortyot, k\u00f6zepes hossz\u00fas\u00e1g\u00fa lecseng\u00e9sbe ny\u00fajtva a gy\u00fcm\u00f6lcs\u00f6s \u00edzeket.',
            'shop.quantity': 'Mennyis\u00e9g:',
            'shop.addCart': 'Kos\u00e1rba',

            'footer.madeBy': 'K\u00e9sz\u00edtette'
        }
    };

    /* -------------------------------------------------------------- helpers */

    function normalize(lang) {
        return SUPPORTED.indexOf(lang) !== -1 ? lang : null;
    }

    function fromQuery() {
        var m = location.search.match(/[?&]lang=([a-z]{2})/i);
        return m ? m[1].toLowerCase() : null;
    }

    function getStored() {
        try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }

    function setStored(lang) {
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
    }

    function resolveLang() {
        return normalize(fromQuery()) || normalize(getStored()) || DEFAULT_LANG;
    }

    function translate(lang, key) {
        var dict = translations[lang] || {};
        if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
        var fallback = translations[DEFAULT_LANG][key];
        if (fallback === undefined) {
            if (window.console) console.warn('[i18n] missing key:', key);
            return null;
        }
        return fallback;
    }

    /* ----------------------------------------------------------------- apply */

    function applyTo(root, lang) {
        root.querySelectorAll('[data-i18n]').forEach(function (el) {
            var value = translate(lang, el.getAttribute('data-i18n'));
            if (value !== null) el.textContent = value;
        });

        root.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
            el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
                var parts = pair.split(':');
                var attr = (parts[0] || '').trim();
                var key = (parts[1] || '').trim();
                if (!attr || !key) return;
                var value = translate(lang, key);
                if (value !== null) el.setAttribute(attr, value);
            });
        });
    }

    function syncSwitchers(lang) {
        document.querySelectorAll('[data-lang-switch]').forEach(function (btn) {
            var active = btn.getAttribute('data-lang-switch') === lang;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-current', active ? 'true' : 'false');
        });
        document.querySelectorAll('[data-lang-current]').forEach(function (el) {
            el.textContent = lang.toUpperCase();
        });
    }

    function closeMenus() {
        document.querySelectorAll('.lang-switch.open').forEach(function (sw) {
            sw.classList.remove('open');
            var toggle = sw.querySelector('[data-lang-toggle]');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
    }

    // Carry the active language across internal page navigation by stamping
    // ?lang= onto same-site .html links. This makes the choice survive even
    // when localStorage is unavailable (e.g. some file:// / private contexts).
    function decorateLinks(lang) {
        document.querySelectorAll('a[href]').forEach(function (a) {
            var href = a.getAttribute('href');
            var m = href && href.match(/^([\w.\-]+\.html)(?:\?[^#]*)?(#.*)?$/);
            if (!m) return;
            a.setAttribute('href', m[1] + (lang !== DEFAULT_LANG ? '?lang=' + lang : '') + (m[2] || ''));
        });
    }

    function updateUrl(lang) {
        if (!window.history || !history.replaceState) return;
        try {
            var url = new URL(location.href);
            if (lang === DEFAULT_LANG) url.searchParams.delete('lang');
            else url.searchParams.set('lang', lang);
            history.replaceState(null, '', url);
        } catch (e) { /* no-op */ }
    }

    function setLang(lang, opts) {
        lang = normalize(lang) || DEFAULT_LANG;
        opts = opts || {};

        document.documentElement.setAttribute('lang', lang);
        applyTo(document, lang);
        syncSwitchers(lang);
        decorateLinks(lang);

        if (opts.persist !== false) {
            setStored(lang);
            updateUrl(lang);
        }

        // Reveal the page once the correct language is in place (no-FOUC cloak).
        document.documentElement.classList.remove('i18n-cloak');
        api.current = lang;

        // Let page-specific code react (e.g. re-fit headline text to new strings).
        try {
            document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: lang } }));
        } catch (e) { /* CustomEvent unsupported */ }
    }

    /* ------------------------------------------------------------------ init */

    function init() {
        setLang(resolveLang(), { persist: false });

        // Event delegation: one listener drives every switcher dropdown.
        document.addEventListener('click', function (e) {
            var toggle = e.target.closest('[data-lang-toggle]');
            if (toggle) {
                e.preventDefault();
                var sw = toggle.closest('.lang-switch');
                var willOpen = sw && !sw.classList.contains('open');
                closeMenus();
                if (willOpen) {
                    sw.classList.add('open');
                    toggle.setAttribute('aria-expanded', 'true');
                }
                return;
            }

            var option = e.target.closest('[data-lang-switch]');
            if (option) {
                e.preventDefault();
                setLang(option.getAttribute('data-lang-switch'));
                closeMenus();
                return;
            }

            closeMenus();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenus();
        });

        if (isDevHost()) validateKeys();
    }

    function isDevHost() {
        return location.protocol === 'file:' ||
            /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(location.hostname);
    }

    function validateKeys() {
        var base = Object.keys(translations[DEFAULT_LANG]);
        SUPPORTED.forEach(function (lang) {
            var missing = base.filter(function (k) {
                return !Object.prototype.hasOwnProperty.call(translations[lang], k);
            });
            var extra = Object.keys(translations[lang]).filter(function (k) {
                return base.indexOf(k) === -1;
            });
            if (missing.length) console.warn('[i18n] "' + lang + '" missing keys:', missing);
            if (extra.length) console.warn('[i18n] "' + lang + '" extra keys:', extra);
        });
    }

    /* --------------------------------------------------------------- exports */

    var api = {
        setLang: setLang,
        translate: translate,
        supported: SUPPORTED.slice(),
        current: DEFAULT_LANG
    };
    window.MenumorutI18N = api;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
