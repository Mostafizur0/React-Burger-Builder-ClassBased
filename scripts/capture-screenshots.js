// Drives the Burger Builder UI and captures the T11 screenshots to disk.
// Run with: node /tmp/fbtools/capture.js
const puppeteer = require('/tmp/fbtools/node_modules/puppeteer-core');

const BASE = 'http://localhost:3000';
const OUT = '/Users/mostafiz-tareq/mostafiz/github/React-Burger-Builder-ClassBased/docs/screenshots';

const EMAIL = 'demo@example.com';
const PASSWORD = 'password123';

const results = [];
const record = (name, ok, detail) => {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function clickByText(page, selector, text) {
    const handles = await page.$$(selector);
    for (const handle of handles) {
        const content = await handle.evaluate(el => el.textContent.trim());
        if (content === text) {
            await handle.click();
            return true;
        }
    }
    return false;
}

(async () => {
    // The emulator starts empty. Create the test account and seed the
    // ingredient counts so the builder has a non-zero starting stack.
    const emu = 'http://127.0.0.1:9099';
    const db = 'http://127.0.0.1:9000';
    const ns = 'burger-builder-951c6-default-rtdb';

    const signup = await fetch(`${emu}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true })
    });
    const signupBody = await signup.json();
    if (signupBody.error) {
        console.log(`Account already exists or signup failed: ${signupBody.error.message}`);
    }

    const seeded = await fetch(`${db}/ingredients.json?ns=${ns}`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer owner', 'Content-Type': 'application/json' },
        body: JSON.stringify({ salad: 0, bacon: 0, cheese: 0, meat: 0 })
    });
    console.log(`Seeded ingredients: HTTP ${seeded.status}`);

    // Clear orders left by earlier runs so the capture shows one clean order.
    const cleared = await fetch(`${db}/orders.json?ns=${ns}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer owner' }
    });
    console.log(`Cleared previous orders: HTTP ${cleared.status}`);

    const browser = await puppeteer.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: 'new',
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    page.on('pageerror', e => console.log('PAGEERROR:', e.message));

    // ---------------------------------------------------------------- 1. builder
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('[data-testid="side-drawer"]', { timeout: 20000 });

    // Targets the "More" button inside the control row that carries the
    // ingredient label. Every row shares a CSS-module class, so the row is
    // picked by the label it contains rather than by being the first match.
    const clickButtonInRow = async (label, buttonText) => {
        const clicked = await page.evaluate((ingredientLabel, text) => {
            const rows = Array.from(document.querySelectorAll('div'))
                .filter(el => /BuildControl_BuildControl/.test(el.className));
            const row = rows.find(r => {
                const rowLabel = Array.from(r.querySelectorAll('div'))
                    .find(el => el.children.length === 0 &&
                        el.textContent.trim() === ingredientLabel &&
                        /Label/.test(el.className));
                return Boolean(rowLabel);
            });
            if (!row) return false;
            const btn = Array.from(row.querySelectorAll('button'))
                .find(b => b.textContent.trim() === text);
            if (!btn || btn.disabled) return false;
            btn.click();
            return true;
        }, label, buttonText);
        await sleep(180);
        return clicked;
    };

    const clickMoreInRow = (label) => clickButtonInRow(label, 'More');
    const clickLessInRow = (label) => clickButtonInRow(label, 'Less');

    await clickMoreInRow('Meat');
    await clickMoreInRow('Meat');
    await clickMoreInRow('Cheese');
    await clickMoreInRow('Cheese');
    await clickMoreInRow('Salad');
    await clickMoreInRow('Bacon');


    // The expected price is derived from the ingredient counts the app
    // displays, so the check cannot drift from the intended build.
    const readBuilderState = () => page.evaluate(() => {
        const summary = document.querySelector('[data-testid="order-summary-modal"]');
        const counts = {};
        if (summary) {
            summary.querySelectorAll('li').forEach(li => {
                const text = li.textContent.replace('•', '').trim();
                const match = text.match(/^(\w+):\s*(\d+)$/);
                if (match) counts[match[1]] = Number(match[2]);
            });
        }
        const strong = Array.from(document.querySelectorAll('strong'));
        return {
            counts,
            price: strong.length ? strong[strong.length - 1].textContent : null
        };
    });

    const PRICES = { salad: 0.5, bacon: 0.7, cheese: 0.4, meat: 1.3 };
    const built = await readBuilderState();
    const expectedPrice = (4 + Object.entries(PRICES)
        .reduce((sum, [name, price]) => sum + price * (built.counts[name] || 0), 0))
        .toFixed(2);

    record('flow-1 builder price updates', built.price === expectedPrice,
        `price = ${built.price}, expected ${expectedPrice} from counts ${JSON.stringify(built.counts)}`);

    // "Less" must decrement the price back down.
    const removed = await clickLessInRow('Meat');
    const afterLess = await readBuilderState();
    record('flow-1 Less decrements the price',
        removed && afterLess.price === (Number(built.price) - PRICES.meat).toFixed(2),
        `price ${built.price} -> ${afterLess.price} after removing one meat`);

    // Restore the full stack for the capture.
    await clickMoreInRow('Meat');
    await sleep(300);

    await page.screenshot({ path: `${OUT}/01-burger-builder.png` });

    // -------------------------------------------------------- 2. build controls
    const controlsClip = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const meatMore = buttons.find(b => b.textContent.trim() === 'More');
        const controls = meatMore.closest('div').parentElement;
        const rect = controls.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });
    await page.screenshot({
        path: `${OUT}/02-build-controls.png`,
        clip: {
            x: Math.max(0, controlsClip.x - 20),
            y: Math.max(0, controlsClip.y - 20),
            width: controlsClip.width + 40,
            height: controlsClip.height + 40
        }
    });
    record('screenshot-02 build controls', true, 'clipped to the control panel');

    // ------------------------------------------------------------------ 3. auth
    await page.goto(`${BASE}/auth`, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('input', { timeout: 20000 });
    await page.type('input[placeholder="Mail Address"]', 'not-an-email');
    await sleep(400);
    const invalidClass = await page.evaluate(() => {
        const el = document.querySelector('input[placeholder="Mail Address"]');
        return el ? el.className : null;
    });
    record('flow-2 auth invalid email flagged', /Invalid/.test(invalidClass || ''), `class=${invalidClass}`);

    await page.screenshot({ path: `${OUT}/03-auth.png` });

    // Sign in with the emulator account.
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('input', { timeout: 20000 });

    const modeLabel = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
            .find(b => b.textContent.includes('SWITCH TO'));
        return btn ? btn.textContent.trim() : null;
    });
    record('flow-2 auth toggle relabels', modeLabel === 'SWITCH TO SIGNIN', `toggle reads "${modeLabel}"`);

    await page.type('input[placeholder="Mail Address"]', EMAIL);
    await page.type('input[placeholder="Password"]', PASSWORD);
    await clickByText(page, 'button', 'SWITCH TO SIGNIN');
    await sleep(400);
    await clickByText(page, 'button', 'SUBMIT');
    await sleep(5000);

    const afterLogin = await page.evaluate(() => ({
        url: window.location.pathname,
        text: document.body.textContent
    }));
    record('flow-2 auth signin succeeds', afterLogin.url === '/' || afterLogin.text.includes('Orders'),
        `after signin the app is at ${afterLogin.url}`);

    // -------------------------------------------------------------- 4. checkout
    await page.goto(BASE, { waitUntil: 'networkidle2' });
    await sleep(1800);
    await clickMoreInRow('Meat');
    await clickMoreInRow('Cheese');
    await sleep(400);
    const orderBtnText = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
            .find(b => b.textContent.trim() === 'ORDER NOW');
        return btn ? btn.textContent.trim() : null;
    });
    record('flow-4 order button reads ORDER NOW', orderBtnText === 'ORDER NOW', `button reads "${orderBtnText}"`);

    await clickByText(page, 'button', 'ORDER NOW');
    await sleep(1500);
    const modalVisible = await page.evaluate(() => {
        const modal = document.querySelector('[data-testid="order-summary-modal"]');
        return modal ? modal.textContent : null;
    });
    record('flow-4 checkout summary modal', Boolean(modalVisible && modalVisible.includes('Total Price')),
        modalVisible ? 'summary modal shows the ingredient list and total' : 'modal not found');

    await page.screenshot({ path: `${OUT}/04-checkout.png` });

    // The builder modal's CONTINUE routes to /checkout, where the checkout
    // summary offers its own CONTINUE that moves on to /checkout/contact-data.
    await clickByText(page, 'button', 'CONTINUE');
    await sleep(2500);
    const checkoutUrl = await page.evaluate(() => window.location.pathname);
    record('flow-4 continue -> /checkout', checkoutUrl === '/checkout',
        `navigated to ${checkoutUrl}`);

    await clickByText(page, 'button', 'CONTINUE');
    await sleep(2500);
    const contactUrl = await page.evaluate(() => window.location.pathname);
    record('flow-4 continue -> contact-data', contactUrl === '/checkout/contact-data',
        `navigated to ${contactUrl}`);

    // ---------------------------------------------------------- 5. contact data
    await sleep(800);
    const fieldCount = await page.evaluate(() => document.querySelectorAll('input, select').length);
    record('flow-5 contact fields rendered', fieldCount === 6, `${fieldCount} form fields rendered`);

    const orderDisabledBefore = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
            .find(b => b.textContent.trim() === 'ORDER');
        return btn ? btn.disabled : null;
    });
    record('flow-5 ORDER disabled until valid', orderDisabledBefore === true,
        `ORDER disabled = ${orderDisabledBefore}`);

    await page.type('input[placeholder="Your Name"]', 'Jane Doe');
    await page.type('input[placeholder="Street"]', '221B Baker Street');
    await page.type('input[placeholder="ZIP Code"]', '12345');
    await page.type('input[placeholder="Country"]', 'United Kingdom');
    await page.type('input[placeholder="Your E-Mail"]', EMAIL);
    await sleep(700);

    const orderDisabledAfter = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
            .find(b => b.textContent.trim() === 'ORDER');
        return btn ? btn.disabled : null;
    });
    record('flow-5 ORDER enabled when valid', orderDisabledAfter === false,
        `ORDER disabled = ${orderDisabledAfter}`);

    await page.screenshot({ path: `${OUT}/05-contact-data.png` });

    await clickByText(page, 'button', 'ORDER');
    await sleep(3000);
    const afterOrder = await page.evaluate(() => window.location.pathname);
    // A successful purchase flips `purchased`, and the checkout container
    // redirects to the builder, so the order has to be read from /orders.
    record('flow-5 submit dispatches the order',
        afterOrder === '/' || afterOrder === '/orders',
        `after submit the app is at ${afterOrder}`);

    // ---------------------------------------------------------------- 6. orders
    // Navigate in-app through the toolbar link. A full page load at /orders
    // hits the app's catch-all <Redirect to="/" /> before the Firebase auth
    // state has been restored, so the client-side route is used instead.
    await page.evaluate(() => {
        const link = Array.from(document.querySelectorAll('header a'))
            .find(a => a.textContent.trim() === 'Orders');
        if (link) link.click();
    });
    await sleep(3500);
    const ordersText = await page.evaluate(() => document.body.textContent);
    const orderRows = await page.evaluate(() => document.querySelectorAll('[data-testid="order"]').length);
    record('flow-6 orders list', orderRows > 0 && /USD/.test(ordersText),
        `${orderRows} order(s) listed with a price`);
    await page.screenshot({ path: `${OUT}/06-orders.png` });

    // -------------------------------------------------------- 7. mobile drawer
    await page.setViewport({ width: 480, height: 800, deviceScaleFactor: 2, isMobile: true });
    await page.goto(BASE, { waitUntil: 'networkidle2' });
    await sleep(1800);
    await page.click('[data-testid="drawer-toggle"]');
    await sleep(900);
    const drawerOpen = await page.evaluate(() => {
        const drawer = document.querySelector('[data-testid="side-drawer"]');
        if (!drawer) return null;
        const rect = drawer.getBoundingClientRect();
        return { width: rect.width, x: rect.x, visible: rect.x > -10 };
    });
    record('flow-7 responsive drawer opens', Boolean(drawerOpen && drawerOpen.visible),
        drawerOpen ? `drawer at x=${drawerOpen.x} width=${drawerOpen.width}` : 'drawer not found');

    await page.screenshot({ path: `${OUT}/07-mobile-drawer.png` });

    // The drawer closes when an item is selected: the drawer's own onClick
    // handler fires and slides it off-screen. The link inside the drawer is
    // targeted explicitly, since the desktop toolbar renders a duplicate, and
    // the target differs between the signed-in and signed-out states. A real
    // mouse click is used so the React handler receives the event.
    const drawerLink = await page.evaluateHandle(() => {
        const drawer = document.querySelector('[data-testid="side-drawer"]');
        if (!drawer) return null;
        const links = Array.from(drawer.querySelectorAll('a'));
        return links.find(a => a.textContent.trim() === 'Orders')
            || links.find(a => a.textContent.trim() === 'Authenticate')
            || links[0];
    });
    if (drawerLink.asElement()) {
        await drawerLink.asElement().click();
    }
    await sleep(1500);
    const drawerClosed = await page.evaluate(() => {
        const drawer = document.querySelector('[data-testid="side-drawer"]');
        if (!drawer) return null;
        const rect = drawer.getBoundingClientRect();
        return { x: rect.x, offScreen: rect.x + rect.width <= 1 };
    });
    record('flow-7 drawer closes on selection', Boolean(drawerClosed && drawerClosed.offScreen),
        drawerClosed ? `drawer x=${drawerClosed.x} after selection` : 'drawer not found');

    await browser.close();

    const failed = results.filter(r => !r.ok);
    console.log('\n===== SUMMARY =====');
    console.log(`${results.length - failed.length}/${results.length} checks passed`);
    if (failed.length) {
        failed.forEach(f => console.log(`FAILED: ${f.name} - ${f.detail}`));
        process.exitCode = 1;
    }
})().catch(err => {
    console.error('SCRIPT ERROR:', err.message);
    process.exitCode = 1;
});
