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
            'hero.reservation': 'BOOK A ROOM',
            'hero.shop': 'SHOP',

            'label.contact': 'CONTACT',
            'label.location': 'LOCATION',
            'label.hours': 'HOURS',
            'label.reserve': 'Book a Room',

            'hours.l1': 'Mon\u2013Wed 6\u201311',
            'hours.l2': 'Thu\u2013Sat 4\u201312',
            'hours.l3': 'Sun 3\u201310',

            'story.title': 'PRODUCING HIGH QUALITY WINES SINCE 1970.',
            'story.p1': 'Menumorut Wines is nestled in Biharia, in a building that gazes out over the rolling hills \u2014 a place where, more than two hundred years ago, a beautiful story began to unfold.',
            'story.p2': 'This is the story of a wine cellar born in the heart of the Cri\u0219ana region, cradled by gentle hills and steeped in history. The wine that first emerged from these lands was named Menumorut, in homage to the ruler who once governed the very soil from which it sprang.',
            'story.p3': 'Today, the Family carries forward a legacy that stretches back more than two centuries \u2014 crafting wines of exceptional quality that enrich, year after year, the living history of this remarkable cellar, where modernity and tradition exist in quiet conversation and where an extraordinary heritage of vineyards and winemaking wisdom has been passed, with devotion, from generation to generation.',
            'story.p4': 'Guided by deep-rooted expertise and an intimate knowledge of their craft, the people here see themselves as faithful interpreters of the land \u2014 its native varieties and their unique terroir. They honor that land by preserving its essential character with care and rigor, working exclusively with grapes from their own vineyards and applying vinification methods refined over decades of dedicated practice, always attentive to the particular nature of each site and the expressive potential of every individual vine.',
            'story.leadStaff': 'LEAD STAFF',
            'story.ownerRole': 'Owner',
            'story.recentPress': 'RECENT PRESS',
            'story.pressFeature': 'Feature',
            'story.visitBtn': 'Visit us',

            'visit.stayTitle': 'Stay at the estate',
            'visit.stayText': 'Wake up among the vineyards. Pick your check-in and check-out dates and the number of guests in our live booking calendar.',
            'visit.bookRoom': 'Book a Room',

            'shop.red.name': 'Menumorut Red',
            'shop.red.desc': 'A substantially bold, complex and layered wine, this is juicy in feel yet firm in structured tannins. Textured and intriguing in sweet oak tones, the fruit components are weighted in cassis and black cherry, with a lasting mineral finish of crushed rock.',
            'shop.white.name': 'Menumorut White',
            'shop.white.desc': 'Flinty mineral, smoke, yellow pear, toasted hazelnut and acacia aromas follow over to the elegant medium-bodied palate along with mature yellow apple and saline. A note of chestnut honey wraps around the finish while fresh acidity keeps it balanced.',
            'shop.rose.name': 'Menumorut Ros\u00e9',
            'shop.rose.desc': 'A wild strawberry and herb aroma carries a slight balsamic edge on the nose. The palate is well rounded and juicy in feel, with delicious red cherry and strawberry flavors that are honed by bright acidity and a tangy slick of wet stone. Cherry skin astringency marks the close, extending the fruit flavors into a medium finish.',
            'shop.quantity': 'Quantity:',
            'shop.addCart': 'Add to Cart',

            'cart.title': 'YOUR CART',
            'cart.empty': 'Your cart is empty.',
            'cart.continueShopping': 'Continue shopping',
            'cart.summary': 'Order Summary',
            'cart.subtotal': 'Subtotal',
            'cart.deliveryNote': 'Delivery calculated at checkout.',
            'cart.checkout': 'Proceed to Checkout',
            'cart.remove': 'Remove',
            'cart.quantity': 'Quantity',
            'cart.increase': 'Increase quantity',
            'cart.decrease': 'Decrease quantity',
            'cart.added': 'Added \u2713',

            'checkout.title': 'CHECKOUT',
            'checkout.delivery': 'Delivery',
            'checkout.delivery.pickup': 'Pickup at the estate',
            'checkout.delivery.standard': 'Standard delivery',
            'checkout.delivery.express': 'Express delivery',
            'checkout.delivery.free': 'Free',
            'checkout.shipsNote': 'We currently ship within Romania and Hungary. Pickup is available at the estate.',
            'checkout.summary': 'Order Summary',
            'checkout.deliveryFee': 'Delivery',
            'checkout.total': 'Total',
            'checkout.pay': 'Pay with card',
            'checkout.secure': 'Secure payment via Stripe',
            'checkout.empty': 'Your cart is empty.',
            'checkout.notConfigured': 'Payments are not configured yet. Add your Stripe publishable key and Price IDs in assets/js/cart.js.',
            'checkout.stripeUnavailable': 'Could not reach Stripe. Please try again.',
            'checkout.error': 'Something went wrong starting checkout.',

            'success.title': 'Thank you for your order',
            'success.body': 'Your payment was successful. A confirmation email is on its way, and we\u2019ll be in touch about delivery.',
            'success.cta': 'Back to the shop',

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
            'hero.reservation': 'REZERV\u0102 O CAMER\u0102',
            'hero.shop': 'MAGAZIN',

            'label.contact': 'CONTACT',
            'label.location': 'LOCA\u021aIE',
            'label.hours': 'PROGRAM',
            'label.reserve': 'Rezerv\u0103 o camer\u0103',

            'hours.l1': 'Lun\u2013Mie 6\u201311',
            'hours.l2': 'Joi\u2013S\u00e2m 4\u201312',
            'hours.l3': 'Dum 3\u201310',

            'story.title': 'PRODUCEM VINURI DE \u00ceNALT\u0102 CALITATE DIN 1970.',
            'story.p1': 'Menumorut Wines se afl\u0103 \u00een Biharia, \u00eentr-o cl\u0103dire care prive\u0219te spre dealurile domoale \u2014 un loc unde, acum mai bine de dou\u0103 sute de ani, a \u00eenceput s\u0103 prind\u0103 contur o poveste frumoas\u0103.',
            'story.p2': 'Este povestea unei crame ap\u0103rute \u00een inima Cri\u0219anei, ocrotite de coline bl\u00e2nde \u0219i \u00eembibate de istorie. Vinul care s-a n\u0103scut pentru prima oar\u0103 pe aceste meleaguri a primit numele Menumorut, ca un omagiu adus voievodului care a st\u0103p\u00e2nit c\u00e2ndva p\u0103m\u00e2nturile din care el izvor\u0103\u0219te.',
            'story.p3': 'Ast\u0103zi, Familia continu\u0103 o mo\u0219tenire care se \u00eentinde pe mai bine de dou\u0103 veacuri \u2014 cre\u00e2nd vinuri de o calitate aleas\u0103, menite s\u0103 \u00eembog\u0103\u021beasc\u0103, an dup\u0103 an, istoria vie a acestei crame remarcabile, acolo unde modernitatea \u0219i tradi\u021bia coexist\u0103 \u00een armonie \u0219i unde un patrimoniu pre\u021bios de vi\u021b\u0103-de-vie \u0219i de \u0219tiin\u021b\u0103 a vinifica\u021biei a fost transmis, cu dragoste \u0219i devotament, din genera\u021bie \u00een genera\u021bie.',
            'story.p4': 'Anima\u021bi de o experien\u021b\u0103 \u00eendelungat\u0103 \u0219i de o \u00een\u021belegere profund\u0103 a locului, oamenii de aici se consider\u0103 interpre\u021bi fideli ai soiurilor autohtone \u0219i ai terorului unic \u00een care acestea cresc. Ei cinstesc p\u0103m\u00e2ntul respect\u00e2nd cu grij\u0103 \u0219i rigoare caracterul s\u0103u specific, lucr\u00e2nd exclusiv cu struguri din propriile podgorii \u0219i aplic\u00e2nd metode de vinifica\u021bie rafinate de-a lungul zecilor de ani de activitate \u2014 \u00eentotdeauna aten\u021bi la particularit\u0103\u021bile fiec\u0103rui loc \u0219i la poten\u021bialul expresiv al fiec\u0103rei vi\u021be \u00een parte.',
            'story.leadStaff': 'ECHIP\u0102 DE CONDUCERE',
            'story.ownerRole': 'Proprietar',
            'story.recentPress': 'PRES\u0102 RECENT\u0102',
            'story.pressFeature': 'Articol',
            'story.visitBtn': 'Viziteaz\u0103-ne',

            'visit.stayTitle': 'Cazare la cram\u0103',
            'visit.stayText': 'Treze\u0219te-te printre vii. Alege datele de check-in \u0219i check-out \u0219i num\u0103rul de oaspe\u021bi \u00een calendarul nostru de rezerv\u0103ri.',
            'visit.bookRoom': 'Rezerv\u0103 o camer\u0103',

            'shop.red.name': 'Menumorut Ro\u0219u',
            'shop.red.desc': 'Un vin substan\u021bial, \u00eendr\u0103zne\u021b, complex \u0219i stratificat, suculent ca senza\u021bie, dar ferm prin taninurile structurate. Texturat \u0219i intrigant \u00een note dulci de stejar, componentele fructate se concentreaz\u0103 pe coac\u0103ze negre \u0219i cire\u0219e negre, cu un final mineral persistent de piatr\u0103 sf\u0103r\u00e2mat\u0103.',
            'shop.white.name': 'Menumorut Alb',
            'shop.white.desc': 'Arome de cremene, fum, par\u0103 galben\u0103, alun\u0103 pr\u0103jit\u0103 \u0219i salc\u00e2m se reg\u0103sesc pe palatul elegant, de corp mediu, al\u0103turi de m\u0103r galben copt \u0219i o not\u0103 s\u0103rat\u0103. O urm\u0103 de miere de castan \u00eenv\u0103luie finalul, \u00een timp ce aciditatea proasp\u0103t\u0103 \u00eel men\u021bine echilibrat.',
            'shop.rose.name': 'Menumorut Ros\u00e9',
            'shop.rose.desc': 'O arom\u0103 de fragi \u0219i ierburi aduce o u\u0219oar\u0103 nuan\u021b\u0103 balsamic\u0103 \u00een nas. Palatul este rotund \u0219i suculent, cu arome delicioase de cire\u0219e ro\u0219ii \u0219i c\u0103p\u0219uni, \u0219lefuite de o aciditate vie \u0219i o tent\u0103 mineral-acidulat\u0103 de piatr\u0103 ud\u0103. Astringen\u021ba cojii de cirea\u0219\u0103 marcheaz\u0103 finalul, prelungind aromele fructate \u00eentr-un final mediu.',
            'shop.quantity': 'Cantitate:',
            'shop.addCart': 'Adaug\u0103 \u00een co\u0219',

            'cart.title': 'CO\u0218UL T\u0102U',
            'cart.empty': 'Co\u0219ul t\u0103u este gol.',
            'cart.continueShopping': 'Continu\u0103 cump\u0103r\u0103turile',
            'cart.summary': 'Sumar comand\u0103',
            'cart.subtotal': 'Subtotal',
            'cart.deliveryNote': 'Livrarea se calculeaz\u0103 la finalizarea comenzii.',
            'cart.checkout': 'Finalizeaz\u0103 comanda',
            'cart.remove': 'Elimin\u0103',
            'cart.quantity': 'Cantitate',
            'cart.increase': 'Cre\u0219te cantitatea',
            'cart.decrease': 'Scade cantitatea',
            'cart.added': 'Ad\u0103ugat \u2713',

            'checkout.title': 'FINALIZARE',
            'checkout.delivery': 'Livrare',
            'checkout.delivery.pickup': 'Ridicare de la cram\u0103',
            'checkout.delivery.standard': 'Livrare standard',
            'checkout.delivery.express': 'Livrare expres',
            'checkout.delivery.free': 'Gratuit',
            'checkout.shipsNote': 'Momentan livr\u0103m \u00een Rom\u00e2nia \u0219i Ungaria. Ridicarea este disponibil\u0103 la cram\u0103.',
            'checkout.summary': 'Sumar comand\u0103',
            'checkout.deliveryFee': 'Livrare',
            'checkout.total': 'Total',
            'checkout.pay': 'Pl\u0103te\u0219te cu cardul',
            'checkout.secure': 'Plat\u0103 securizat\u0103 prin Stripe',
            'checkout.empty': 'Co\u0219ul t\u0103u este gol.',
            'checkout.notConfigured': 'Pl\u0103\u021bile nu sunt \u00eenc\u0103 configurate. Adaug\u0103 cheia publicabil\u0103 Stripe \u0219i ID-urile de pre\u021b \u00een assets/js/cart.js.',
            'checkout.stripeUnavailable': 'Nu am putut contacta Stripe. \u00cencearc\u0103 din nou.',
            'checkout.error': 'A ap\u0103rut o eroare la pornirea pl\u0103\u021bii.',

            'success.title': 'Mul\u021bumim pentru comand\u0103',
            'success.body': 'Plata a fost efectuat\u0103 cu succes. Un e-mail de confirmare este pe drum \u0219i te vom contacta privind livrarea.',
            'success.cta': '\u00cenapoi la magazin',

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
            'hero.reservation': 'SZOB\u00c1T FOGLALOK',
            'hero.shop': 'BOLT',

            'label.contact': 'KAPCSOLAT',
            'label.location': 'HELYSZ\u00cdN',
            'label.hours': 'NYITVATART\u00c1S',
            'label.reserve': 'Szobafoglal\u00e1s',

            'hours.l1': 'H\u00e9t\u2013Sze 6\u201311',
            'hours.l2': 'Cs\u00fc\u2013Szo 4\u201312',
            'hours.l3': 'Vas 3\u201310',

            'story.title': '1970 \u00d3TA KIV\u00c1L\u00d3 MIN\u0150S\u00c9G\u0170 BOROKAT K\u00c9SZ\u00cdT\u00dcNK.',
            'story.p1': 'A Menumorut Wines pinc\u00e9szet Bihar v\u00e1ros\u00e1ban, a dombok f\u00f6l\u00e9 magasod\u00f3 \u00e9p\u00fcletben kapott otthonra \u2014 egy olyan helyen, ahol t\u00f6bb mint k\u00e9tsz\u00e1z \u00e9vvel ezel\u0151tt egy sz\u00e9p t\u00f6rt\u00e9net kezdett kibontakozni.',
            'story.p2': 'Ez a K\u00f6r\u00f6s-vid\u00e9k sz\u00edv\u00e9ben sz\u00fcletett borpince t\u00f6rt\u00e9nete, amelyet szel\u00edd dombok \u00f6lelnek k\u00f6r\u00fcl, \u00e9s amelyet m\u00e9lyen \u00e1that a m\u00falt. Az itt els\u0151k\u00e9nt termelt bort Menumorut-nak nevezt\u00e9k el, tisztelegve ezzel az egykori fejedelem eml\u00e9ke el\u0151tt, aki ezen a f\u00f6ld\u00f6n uralkodott, ahol a bor megsz\u00fcletett.',
            'story.p3': 'Ma a Csal\u00e1d egy t\u00f6bb mint k\u00e9tsz\u00e1z \u00e9ves \u00f6r\u00f6ks\u00e9g folytat\u00f3jak\u00e9nt dolgozik \u2014 kiv\u00e1l\u00f3 min\u0151s\u00e9g\u0171 borokat alkotva, amelyek \u00e9vr\u0151l \u00e9vre gazdag\u00edtj\u00e1k e rendk\u00edv\u00fcli pince \u00e9l\u0151 t\u00f6rt\u00e9nelm\u00e9t. Ez az a hely, ahol a modernit\u00e1s \u00e9s a hagyom\u00e1ny csendesen megf\u00e9r egym\u00e1s mellett, s ahol a sz\u0151l\u0151k \u00e9s a bor\u00e1szati tud\u00e1s felbecs\u00fclhetetlen \u00f6r\u00f6ks\u00e9ge nemzed\u00e9kr\u0151l nemzed\u00e9kre, szeretettel \u00e9s elk\u00f6telezetts\u00e9ggel sz\u00e1ll tov\u00e1bb.',
            'story.p4': 'M\u00e9ly gy\u00f6ker\u0171 szaktud\u00e1s \u00e9s a t\u00e1j ir\u00e1nti bens\u0151s\u00e9ges elk\u00f6telezetts\u00e9g vez\u00e9rli az itt dolgoz\u00f3kat, akik \u00f6nmagukat a f\u00f6ld h\u0171s\u00e9ges tolm\u00e1csaik\u00e9nt tekintik \u2014 a honos fajt\u00e1kat \u00e9s azok egyedi terroirj\u00e1t tisztelve \u00e9s gondosan meg\u0151rizve. Kiz\u00e1r\u00f3lag saj\u00e1t \u00fcltetv\u00e9nyeik sz\u0151l\u0151j\u00e9vel dolgoznak, \u00e9s \u00e9vtizedek kitart\u00f3 munk\u00e1j\u00e1val csiszolt vinifik\u00e1ci\u00f3s m\u00f3dszereket alkalmaznak \u2014 mindig figyelve az egyes ter\u00fcletek saj\u00e1toss\u00e1gaira \u00e9s minden egyes t\u0151ke kifejez\u0151erej\u00e9re.',
            'story.leadStaff': 'VEZET\u0150S\u00c9G',
            'story.ownerRole': 'Tulajdonos',
            'story.recentPress': 'SAJT\u00d3',
            'story.pressFeature': 'Cikk',
            'story.visitBtn': 'L\u00e1togass el',

            'visit.stayTitle': 'Sz\u00e1ll\u00e1s a birtokon',
            'visit.stayText': '\u00c9bredj a sz\u0151l\u0151skertek k\u00f6z\u00f6tt. V\u00e1laszd ki az \u00e9rkez\u00e9s \u00e9s t\u00e1voz\u00e1s d\u00e1tum\u00e1t \u00e9s a vend\u00e9gek sz\u00e1m\u00e1t \u00e9l\u0151 foglal\u00e1si napt\u00e1runkban.',
            'visit.bookRoom': 'Szobafoglal\u00e1s',

            'shop.red.name': 'Menumorut V\u00f6r\u00f6s',
            'shop.red.desc': 'Tartalmas, mer\u00e9sz, \u00f6sszetett \u00e9s r\u00e9tegzett bor, \u00e9rzet\u00e9ben zamatos, m\u00e9gis feszes, struktur\u00e1lt tanninokkal. Text\u00far\u00e1s \u00e9s izgalmas, \u00e9des t\u00f6lgyf\u00e1s t\u00f3nusokkal; gy\u00fcm\u00f6lcs\u00f6s \u00f6sszetev\u0151i a feketeribizli \u00e9s a fekete cseresznye k\u00f6r\u00e9 \u00e9p\u00fclnek, tart\u00f3s, z\u00fazott k\u00f6ves \u00e1sv\u00e1nyi lecseng\u00e9ssel.',
            'shop.white.name': 'Menumorut Feh\u00e9r',
            'shop.white.desc': 'Kovak\u00f6ves \u00e1sv\u00e1nyoss\u00e1g, f\u00fcst, s\u00e1rga k\u00f6rte, p\u00edr\u00edtott mogyor\u00f3 \u00e9s ak\u00e1c arom\u00e1i k\u00eds\u00e9rik az eleg\u00e1ns, k\u00f6z\u00e9ptest\u0171 \u00edzvil\u00e1got az \u00e9rett s\u00e1rga alma \u00e9s a s\u00f3s jegyek mellett. A lecseng\u00e9st gesztenyem\u00e9z \u00f6leli k\u00f6r\u00fcl, mik\u00f6zben a friss savak egyens\u00falyban tartj\u00e1k.',
            'shop.rose.name': 'Menumorut Ros\u00e9',
            'shop.rose.desc': 'Vadeper \u00e9s gy\u00f3gyn\u00f6v\u00e9nyek arom\u00e1ja enyhe balzsamos \u00e9llel jelenik meg az illatban. Az \u00edzvil\u00e1g kerek \u00e9s zamatos, \u00ednycsikland\u00f3 piros cseresznye \u00e9s eper \u00edzekkel, amelyeket \u00e9l\u00e9nk savak \u00e9s nedves k\u0151 pik\u00e1ns jegye csiszol. A cseresznyeh\u00e9j fanyars\u00e1ga z\u00e1rja a kortyot, k\u00f6zepes hossz\u00fas\u00e1g\u00fa lecseng\u00e9sbe ny\u00fajtva a gy\u00fcm\u00f6lcs\u00f6s \u00edzeket.',
            'shop.quantity': 'Mennyis\u00e9g:',
            'shop.addCart': 'Kos\u00e1rba',

            'cart.title': 'A KOSARAD',
            'cart.empty': 'A kosarad \u00fcres.',
            'cart.continueShopping': 'Tov\u00e1bbi v\u00e1s\u00e1rl\u00e1s',
            'cart.summary': 'Rendel\u00e9s \u00f6sszegz\u00e9se',
            'cart.subtotal': 'R\u00e9sz\u00f6sszeg',
            'cart.deliveryNote': 'A sz\u00e1ll\u00edt\u00e1s a p\u00e9nzt\u00e1rn\u00e1l sz\u00e1m\u00edt\u00f3dik ki.',
            'cart.checkout': 'Tov\u00e1bb a p\u00e9nzt\u00e1rhoz',
            'cart.remove': 'Elt\u00e1vol\u00edt\u00e1s',
            'cart.quantity': 'Mennyis\u00e9g',
            'cart.increase': 'Mennyis\u00e9g n\u00f6vel\u00e9se',
            'cart.decrease': 'Mennyis\u00e9g cs\u00f6kkent\u00e9se',
            'cart.added': 'Hozz\u00e1adva \u2713',

            'checkout.title': 'P\u00c9NZT\u00c1R',
            'checkout.delivery': 'Sz\u00e1ll\u00edt\u00e1s',
            'checkout.delivery.pickup': '\u00c1tv\u00e9tel a birtokon',
            'checkout.delivery.standard': 'Standard sz\u00e1ll\u00edt\u00e1s',
            'checkout.delivery.express': 'Expressz sz\u00e1ll\u00edt\u00e1s',
            'checkout.delivery.free': 'Ingyenes',
            'checkout.shipsNote': 'Jelenleg Rom\u00e1ni\u00e1ba \u00e9s Magyarorsz\u00e1gra sz\u00e1ll\u00edtunk. Az \u00e1tv\u00e9tel a birtokon is lehets\u00e9ges.',
            'checkout.summary': 'Rendel\u00e9s \u00f6sszegz\u00e9se',
            'checkout.deliveryFee': 'Sz\u00e1ll\u00edt\u00e1s',
            'checkout.total': '\u00d6sszesen',
            'checkout.pay': 'Fizet\u00e9s k\u00e1rty\u00e1val',
            'checkout.secure': 'Biztons\u00e1gos fizet\u00e9s a Stripe-on kereszt\u00fcl',
            'checkout.empty': 'A kosarad \u00fcres.',
            'checkout.notConfigured': 'A fizet\u00e9s m\u00e9g nincs be\u00e1ll\u00edtva. Add meg a Stripe nyilv\u00e1nos kulcsot \u00e9s a Price ID-kat az assets/js/cart.js f\u00e1jlban.',
            'checkout.stripeUnavailable': 'Nem siker\u00fclt el\u00e9rni a Stripe-ot. K\u00e9rj\u00fck, pr\u00f3b\u00e1ld \u00fajra.',
            'checkout.error': 'Hiba t\u00f6rt\u00e9nt a fizet\u00e9s ind\u00edt\u00e1sakor.',

            'success.title': 'K\u00f6sz\u00f6nj\u00fck a rendel\u00e9sed',
            'success.body': 'A fizet\u00e9s sikeres volt. A visszaigazol\u00f3 e-mail \u00faton van, \u00e9s hamarosan jelentkez\u00fcnk a sz\u00e1ll\u00edt\u00e1ssal kapcsolatban.',
            'success.cta': 'Vissza a boltba',

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
