import { chromium } from 'playwright';
import { resolve } from 'node:path';

const EVIDENCE_DIR = 'C:/Users/DELL/.gemini/antigravity-ide/brain/22055f8f-0579-4085-8254-14de651f5fc3/evidence';

async function capture() {
  const browser = await chromium.launch({ headless: true });

  // 1. Mobile 390px
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto('http://localhost:4321/', { waitUntil: 'networkidle', timeout: 15000 });
  await mobilePage.screenshot({ path: `${EVIDENCE_DIR}/ms36_02_mobile_390px.png` });
  console.log('Captured ms36_02_mobile_390px.png');
  await mobileCtx.close();

  // 2. Tablet 768px
  const tabletCtx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tabletPage = await tabletCtx.newPage();
  await tabletPage.goto('http://localhost:4321/learn', { waitUntil: 'networkidle', timeout: 15000 });
  await tabletPage.screenshot({ path: `${EVIDENCE_DIR}/ms36_03_tablet_768px.png` });
  console.log('Captured ms36_03_tablet_768px.png');
  await tabletCtx.close();

  // 3. Desktop 1440px
  const deskCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const deskPage = await deskCtx.newPage();
  await deskPage.goto('http://localhost:4321/shop', { waitUntil: 'networkidle', timeout: 15000 });
  await deskPage.screenshot({ path: `${EVIDENCE_DIR}/ms36_04_desktop_1440px.png` });
  console.log('Captured ms36_04_desktop_1440px.png');

  // 4. Admin console login
  await deskPage.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
  await deskPage.screenshot({ path: `${EVIDENCE_DIR}/ms36_05_admin_login.png` });
  console.log('Captured ms36_05_admin_login.png');

  // 5. Knowledge Hub article / learn
  await deskPage.goto('http://localhost:4321/learn', { waitUntil: 'networkidle', timeout: 15000 });
  await deskPage.screenshot({ path: `${EVIDENCE_DIR}/ms36_01_greflect_live.png` });
  console.log('Captured ms36_01_greflect_live.png');
  await deskCtx.close();

  await browser.close();
  console.log('All MS3.6 visual evidence captured successfully.');
}

capture().catch((e) => {
  console.error('Evidence capture failed:', e.message);
  process.exit(1);
});
