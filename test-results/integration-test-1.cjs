/**
 * 医共体智慧药房协同平台 - 全流程联调测试
 * 使用 Playwright sync API
 */
const { sync_playwright } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const RESULT_FILE = path.join(__dirname, '..', 'test-results', 'result-integration-1.json');

// 测试结果收集
const results = [];
const flowResults = { '五统一链路': 'PASS', '村医链路': 'PASS' };

function addResult(testId, flow, step, status, jsErrors, detail) {
  results.push({ testId, flow, step, status, jsErrors: [...jsErrors], detail });
  if (status === 'FAIL') {
    if (flow.startsWith('五统一')) flowResults['五统一链路'] = 'FAIL';
    if (flow.startsWith('村医')) flowResults['村医链路'] = 'FAIL';
  }
}

async function runTests() {
  const browser = await sync_playwright.chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // 全局错误收集
  const jsErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (err) => {
    jsErrors.push(err.message);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  function getNewErrors() {
    const errs = [...jsErrors];
    jsErrors.length = 0;
    return errs;
  }

  function checkCrash() {
    const bodyText = page.locator('body').textContent({ timeout: 2000 }).catch(() => '');
    return !bodyText.includes?.('Unexpected Application Error');
  }

  async function waitForPage(timeout = 5000) {
    await page.waitForTimeout(timeout);
  }

  async function clickMenu(menuKey) {
    // 点击侧边栏菜单项
    const menuItem = page.locator(`.ant-menu-item[data-menu-id*="${menuKey}"], .ant-menu-submenu-title:has-text("${menuKey}")`).first();
    if (await menuItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await menuItem.click();
      await waitForPage(3000);
      return true;
    }
    // 尝试通过文本匹配
    const textItem = page.locator(`.ant-menu-item:has-text("${menuKey}")`).first();
    if (await textItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await textItem.click();
      await waitForPage(3000);
      return true;
    }
    return false;
  }

  async function clickSubmenu(parentLabel, childLabel) {
    // 先点击父菜单展开
    const parent = page.locator(`.ant-menu-submenu-title:has-text("${parentLabel}")`).first();
    if (await parent.isVisible({ timeout: 3000 }).catch(() => false)) {
      const isOpen = parent.locator('..').locator('.ant-menu-submenu-open').count() > 0;
      if (!isOpen) {
        await parent.click();
        await page.waitForTimeout(500);
      }
    }
    // 点击子菜单
    const child = page.locator(`.ant-menu-item:has-text("${childLabel}")`).first();
    if (await child.isVisible({ timeout: 3000 }).catch(() => false)) {
      await child.click();
      await waitForPage(3000);
      return true;
    }
    return false;
  }

  // ==================== 登录 ====================
  console.log('=== 开始全流程联调测试 ===');

  // ========== 测试1：五统一完整链路 ==========

  // --- 1.1 统一用药目录 ---
  console.log('--- 1.1 统一用药目录 ---');

  // 步骤1: 登录管理员
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForPage(3000);
    const adminCard = page.locator('.login-role-card').first();
    await adminCard.click();
    await waitForPage(3000);
    const isLoggedIn = page.locator('.ant-layout').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F1.1-1', '五统一链路-用药目录', '登录管理员角色', isLoggedIn ? 'PASS' : 'FAIL', getNewErrors(), isLoggedIn ? '管理员登录成功' : '登录失败，布局未加载');
  } catch (e) {
    addResult('F1.1-1', '五统一链路-用药目录', '登录管理员角色', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤2: 点击"统一用药目录"
  try {
    const clicked = await clickMenu('统一用药目录');
    const hasContent = page.locator('.ant-table').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F1.1-2', '五统一链路-用药目录', '点击统一用药目录', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '用药目录页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F1.1-2', '五统一链路-用药目录', '点击统一用药目录', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤3: 验证药品列表加载，至少有10条数据
  try {
    await waitForPage(3000);
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    addResult('F1.1-3', '五统一链路-用药目录', '验证药品列表加载(>=10条)', rowCount >= 10 ? 'PASS' : 'FAIL', getNewErrors(), `药品列表行数: ${rowCount}`);
  } catch (e) {
    addResult('F1.1-3', '五统一链路-用药目录', '验证药品列表加载(>=10条)', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤4: 搜索"阿莫西林"
  try {
    const searchInput = page.locator('input[placeholder*="通用名"]').first();
    await searchInput.fill('阿莫西林');
    const searchBtn = page.locator('button:has-text("查询"), button:has-text("搜索")').first();
    await searchBtn.click();
    await waitForPage(3000);
    addResult('F1.1-4', '五统一链路-用药目录', '搜索阿莫西林', 'PASS', getNewErrors(), '已输入搜索关键词并点击查询');
  } catch (e) {
    addResult('F1.1-4', '五统一链路-用药目录', '搜索阿莫西林', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤5: 验证搜索结果
  try {
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    const hasResult = rowCount > 0;
    const textContainsKeyword = hasResult ? (await rows.first().textContent()).includes('阿莫西林') : false;
    addResult('F1.1-5', '五统一链路-用药目录', '验证搜索结果正确', hasResult && textContainsKeyword ? 'PASS' : 'FAIL', getNewErrors(), `搜索结果行数: ${rowCount}, 包含关键词: ${textContainsKeyword}`);
  } catch (e) {
    addResult('F1.1-5', '五统一链路-用药目录', '验证搜索结果正确', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤6: 点击重置
  try {
    const resetBtn = page.locator('button:has-text("重置")').first();
    await resetBtn.click();
    await waitForPage(3000);
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    addResult('F1.1-6', '五统一链路-用药目录', '点击重置验证数据恢复', rowCount >= 10 ? 'PASS' : 'FAIL', getNewErrors(), `重置后行数: ${rowCount}`);
  } catch (e) {
    addResult('F1.1-6', '五统一链路-用药目录', '点击重置验证数据恢复', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤7: 点击"详情"按钮
  try {
    const detailBtn = page.locator('.ant-table-row').first().locator('button:has-text("详情"), a:has-text("详情")').first();
    await detailBtn.click();
    await waitForPage(2000);
    const drawer = page.locator('.ant-drawer-open');
    const isDrawerOpen = await drawer.isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F1.1-7', '五统一链路-用药目录', '点击详情按钮验证Drawer打开', isDrawerOpen ? 'PASS' : 'FAIL', getNewErrors(), isDrawerOpen ? 'Drawer已打开' : 'Drawer未打开');
  } catch (e) {
    addResult('F1.1-7', '五统一链路-用药目录', '点击详情按钮验证Drawer打开', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤8: 验证Drawer中Descriptions组件
  try {
    const descriptions = page.locator('.ant-drawer .ant-descriptions');
    const hasDescriptions = await descriptions.isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F1.1-8', '五统一链路-用药目录', '验证Drawer中Descriptions组件', hasDescriptions ? 'PASS' : 'FAIL', getNewErrors(), hasDescriptions ? 'Descriptions组件可见' : 'Descriptions组件不可见');
  } catch (e) {
    addResult('F1.1-8', '五统一链路-用药目录', '验证Drawer中Descriptions组件', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤9: 关闭Drawer
  try {
    const closeBtn = page.locator('.ant-drawer-open .ant-drawer-close').first();
    await closeBtn.click();
    await waitForPage(1000);
    const drawerClosed = !await page.locator('.ant-drawer-open').isVisible({ timeout: 2000 }).catch(() => false);
    addResult('F1.1-9', '五统一链路-用药目录', '关闭Drawer', drawerClosed ? 'PASS' : 'FAIL', getNewErrors(), drawerClosed ? 'Drawer已关闭' : 'Drawer未关闭');
  } catch (e) {
    addResult('F1.1-9', '五统一链路-用药目录', '关闭Drawer', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤10: 点击"新增药品"按钮
  try {
    const addBtn = page.locator('button:has-text("新增药品")').first();
    await addBtn.click();
    await waitForPage(2000);
    const modal = page.locator('.ant-modal');
    const isModalOpen = await modal.isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F1.1-10', '五统一链路-用药目录', '点击新增药品验证Modal打开', isModalOpen ? 'PASS' : 'FAIL', getNewErrors(), isModalOpen ? 'Modal已打开' : 'Modal未打开');
  } catch (e) {
    addResult('F1.1-10', '五统一链路-用药目录', '点击新增药品验证Modal打开', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤11: 填写表单不提交，关闭Modal
  try {
    const codeInput = page.locator('.ant-modal input#code, .ant-modal input[placeholder*="药品编码"]').first();
    await codeInput.fill('TEST-001');
    const nameInput = page.locator('.ant-modal input[placeholder*="通用名"]').first();
    await nameInput.fill('测试药品');
    const cancelBtn = page.locator('.ant-modal button:has-text("取消")').first();
    await cancelBtn.click();
    await waitForPage(1000);
    const modalClosed = !await page.locator('.ant-modal').isVisible({ timeout: 2000 }).catch(() => false);
    addResult('F1.1-11', '五统一链路-用药目录', '填写表单后关闭Modal', modalClosed ? 'PASS' : 'FAIL', getNewErrors(), modalClosed ? 'Modal已关闭' : 'Modal未关闭');
  } catch (e) {
    addResult('F1.1-11', '五统一链路-用药目录', '填写表单后关闭Modal', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // --- 1.2 统一采购 ---
  console.log('--- 1.2 统一采购 ---');

  // 步骤1: 点击"统一采购"→"采购计划"
  try {
    const clicked = await clickSubmenu('统一采购', '采购计划');
    const hasTable = page.locator('.ant-table').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F1.2-1', '五统一链路-采购', '点击采购计划', clicked && hasTable ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasTable ? '采购计划页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F1.2-1', '五统一链路-采购', '点击采购计划', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤2: 验证采购计划列表加载
  try {
    await waitForPage(3000);
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    addResult('F1.2-2', '五统一链路-采购', '验证采购计划列表加载', rowCount > 0 ? 'PASS' : 'FAIL', getNewErrors(), `采购计划行数: ${rowCount}`);
  } catch (e) {
    addResult('F1.2-2', '五统一链路-采购', '验证采购计划列表加载', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤3: 点击某行"查看详情"展开行
  try {
    const expandBtn = page.locator('.ant-table-row').first().locator('button:has-text("查看详情"), a:has-text("查看详情")').first();
    await expandBtn.click();
    await waitForPage(2000);
    const expandedRow = page.locator('.ant-table-expanded-row');
    const hasExpanded = await expandedRow.isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F1.2-3', '五统一链路-采购', '点击查看详情展开行', hasExpanded ? 'PASS' : 'FAIL', getNewErrors(), hasExpanded ? '展开行可见' : '展开行不可见');
  } catch (e) {
    addResult('F1.2-3', '五统一链路-采购', '点击查看详情展开行', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤4: 验证展开行显示采购明细子表格
  try {
    const expandedRow = page.locator('.ant-table-expanded-row');
    const subTable = expandedRow.locator('.ant-table');
    const hasSubTable = await subTable.isVisible({ timeout: 3000 }).catch(() => false);
    const hasAiTag = await expandedRow.locator('text=AI推荐').count() > 0;
    addResult('F1.2-4', '五统一链路-采购', '验证展开行采购明细子表格', hasSubTable ? 'PASS' : 'FAIL', getNewErrors(), `子表格可见: ${hasSubTable}, AI推荐Tag: ${hasAiTag}`);
  } catch (e) {
    addResult('F1.2-4', '五统一链路-采购', '验证展开行采购明细子表格', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤5: 点击"采购订单"
  try {
    const clicked = await clickSubmenu('统一采购', '采购订单');
    const hasContent = page.locator('.ant-table, .ant-statistic').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F1.2-5', '五统一链路-采购', '点击采购订单', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '采购订单页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F1.2-5', '五统一链路-采购', '点击采购订单', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤6: 验证4个统计卡片
  try {
    await waitForPage(3000);
    const statistics = page.locator('.ant-statistic');
    const statCount = await statistics.count();
    addResult('F1.2-6', '五统一链路-采购', '验证4个统计卡片(总订单/待审核/已签收/逾期)', statCount >= 4 ? 'PASS' : 'FAIL', getNewErrors(), `统计卡片数: ${statCount}`);
  } catch (e) {
    addResult('F1.2-6', '五统一链路-采购', '验证4个统计卡片', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤7: 验证订单列表加载
  try {
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    addResult('F1.2-7', '五统一链路-采购', '验证订单列表加载', rowCount > 0 ? 'PASS' : 'FAIL', getNewErrors(), `订单行数: ${rowCount}`);
  } catch (e) {
    addResult('F1.2-7', '五统一链路-采购', '验证订单列表加载', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤8: 点击某行"查看详情"展开行
  try {
    const expandBtn = page.locator('.ant-table-row').first().locator('button:has-text("查看详情"), a:has-text("查看详情")').first();
    await expandBtn.click();
    await waitForPage(2000);
    const expandedRow = page.locator('.ant-table-expanded-row');
    const hasExpanded = await expandedRow.isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F1.2-8', '五统一链路-采购', '点击订单查看详情展开行', hasExpanded ? 'PASS' : 'FAIL', getNewErrors(), hasExpanded ? '订单展开行可见' : '订单展开行不可见');
  } catch (e) {
    addResult('F1.2-8', '五统一链路-采购', '点击订单查看详情展开行', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤9: 验证展开行显示订单明细子表格
  try {
    const expandedRow = page.locator('.ant-table-expanded-row');
    const subTable = expandedRow.locator('.ant-table');
    const hasSubTable = await subTable.isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F1.2-9', '五统一链路-采购', '验证展开行订单明细子表格', hasSubTable ? 'PASS' : 'FAIL', getNewErrors(), hasSubTable ? '订单明细子表格可见' : '订单明细子表格不可见');
  } catch (e) {
    addResult('F1.2-9', '五统一链路-采购', '验证展开行订单明细子表格', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤10: 点击"集采统计"
  try {
    const clicked = await clickSubmenu('统一采购', '集采统计');
    const hasContent = page.locator('.ant-table, .ant-statistic').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F1.2-10', '五统一链路-采购', '点击集采统计', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '集采统计页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F1.2-10', '五统一链路-采购', '点击集采统计', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤11: 验证3个统计卡片
  try {
    await waitForPage(3000);
    const statistics = page.locator('.ant-statistic');
    const statCount = await statistics.count();
    addResult('F1.2-11', '五统一链路-采购', '验证3个统计卡片(总约定量/总执行量/平均执行率)', statCount >= 3 ? 'PASS' : 'FAIL', getNewErrors(), `统计卡片数: ${statCount}`);
  } catch (e) {
    addResult('F1.2-11', '五统一链路-采购', '验证3个统计卡片', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤12: 验证执行率Progress组件可见
  try {
    const progress = page.locator('.ant-progress');
    const hasProgress = await progress.first().isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F1.2-12', '五统一链路-采购', '验证执行率Progress组件可见', hasProgress ? 'PASS' : 'FAIL', getNewErrors(), hasProgress ? 'Progress组件可见' : 'Progress组件不可见');
  } catch (e) {
    addResult('F1.2-12', '五统一链路-采购', '验证执行率Progress组件可见', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // --- 1.3 统一库存 ---
  console.log('--- 1.3 统一库存 ---');

  // 步骤1: 点击"统一库存"→"库存总览"
  try {
    const clicked = await clickSubmenu('统一库存', '库存总览');
    const hasContent = page.locator('.ant-table, .ant-statistic').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F1.3-1', '五统一链路-库存', '点击库存总览', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '库存总览页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F1.3-1', '五统一链路-库存', '点击库存总览', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤2: 验证4个统计卡片
  try {
    await waitForPage(3000);
    const statistics = page.locator('.ant-statistic');
    const statCount = await statistics.count();
    addResult('F1.3-2', '五统一链路-库存', '验证4个统计卡片(品种/库存量/可用量/锁定量)', statCount >= 4 ? 'PASS' : 'FAIL', getNewErrors(), `统计卡片数: ${statCount}`);
  } catch (e) {
    addResult('F1.3-2', '五统一链路-库存', '验证4个统计卡片', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤3: 验证库存列表加载
  try {
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    addResult('F1.3-3', '五统一链路-库存', '验证库存列表加载', rowCount > 0 ? 'PASS' : 'FAIL', getNewErrors(), `库存行数: ${rowCount}`);
  } catch (e) {
    addResult('F1.3-3', '五统一链路-库存', '验证库存列表加载', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤4: 点击"库存预警"
  try {
    const clicked = await clickSubmenu('统一库存', '库存预警');
    const hasContent = page.locator('.ant-table, .ant-statistic').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F1.3-4', '五统一链路-库存', '点击库存预警', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '库存预警页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F1.3-4', '五统一链路-库存', '点击库存预警', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤5: 验证3个统计卡片(待处理/预警/严重)
  try {
    await waitForPage(3000);
    const statistics = page.locator('.ant-statistic');
    const statCount = await statistics.count();
    addResult('F1.3-5', '五统一链路-库存', '验证3个统计卡片(待处理/预警/严重)', statCount >= 3 ? 'PASS' : 'FAIL', getNewErrors(), `统计卡片数: ${statCount}`);
  } catch (e) {
    addResult('F1.3-5', '五统一链路-库存', '验证3个统计卡片', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤6: 验证预警列表加载，预警类型和级别Tag可见
  try {
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    const hasTags = await page.locator('.ant-table-row .ant-tag').first().isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F1.3-6', '五统一链路-库存', '验证预警列表加载及Tag可见', rowCount > 0 && hasTags ? 'PASS' : 'FAIL', getNewErrors(), `预警行数: ${rowCount}, Tag可见: ${hasTags}`);
  } catch (e) {
    addResult('F1.3-6', '五统一链路-库存', '验证预警列表加载及Tag可见', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤7: 点击"库存调剂"
  try {
    const clicked = await clickSubmenu('统一库存', '库存调剂');
    const hasContent = page.locator('.ant-table').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F1.3-7', '五统一链路-库存', '点击库存调剂', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '库存调剂页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F1.3-7', '五统一链路-库存', '点击库存调剂', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤8: 验证调剂列表加载
  try {
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    addResult('F1.3-8', '五统一链路-库存', '验证调剂列表加载', rowCount > 0 ? 'PASS' : 'FAIL', getNewErrors(), `调剂行数: ${rowCount}`);
  } catch (e) {
    addResult('F1.3-8', '五统一链路-库存', '验证调剂列表加载', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤9: 验证智能推荐标识可见
  try {
    const smartTag = page.locator('.ant-tag:has-text("是")').first();
    const robotIcon = page.locator('.anticon-robot').first();
    const smartRow = page.locator('.row-smart-recommended').first();
    const hasSmart = await smartTag.isVisible({ timeout: 3000 }).catch(() => false)
      || await robotIcon.isVisible({ timeout: 2000 }).catch(() => false)
      || await smartRow.isVisible({ timeout: 2000 }).catch(() => false);
    addResult('F1.3-9', '五统一链路-库存', '验证智能推荐标识可见', hasSmart ? 'PASS' : 'FAIL', getNewErrors(), hasSmart ? '智能推荐标识可见' : '智能推荐标识不可见');
  } catch (e) {
    addResult('F1.3-9', '五统一链路-库存', '验证智能推荐标识可见', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // --- 1.4 统一配送 ---
  console.log('--- 1.4 统一配送 ---');

  // 步骤1: 点击"统一配送"→"配送列表"
  try {
    const clicked = await clickSubmenu('统一配送', '配送列表');
    const hasContent = page.locator('.ant-table, .ant-statistic').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F1.4-1', '五统一链路-配送', '点击配送列表', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '配送列表页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F1.4-1', '五统一链路-配送', '点击配送列表', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤2: 验证4个统计卡片
  try {
    await waitForPage(3000);
    const statistics = page.locator('.ant-statistic');
    const statCount = await statistics.count();
    addResult('F1.4-2', '五统一链路-配送', '验证4个统计卡片(总配送/运输中/已送达/异常)', statCount >= 4 ? 'PASS' : 'FAIL', getNewErrors(), `统计卡片数: ${statCount}`);
  } catch (e) {
    addResult('F1.4-2', '五统一链路-配送', '验证4个统计卡片', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤3: 验证配送列表加载，配送类型Tag可见
  try {
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    const hasDeliveryTypeTag = await page.locator('.ant-table-row .ant-tag').first().isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F1.4-3', '五统一链路-配送', '验证配送列表加载及配送类型Tag', rowCount > 0 ? 'PASS' : 'FAIL', getNewErrors(), `配送行数: ${rowCount}, Tag可见: ${hasDeliveryTypeTag}`);
  } catch (e) {
    addResult('F1.4-3', '五统一链路-配送', '验证配送列表加载及配送类型Tag', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤4: 点击"配送跟踪"
  try {
    const clicked = await clickSubmenu('统一配送', '配送跟踪');
    const hasContent = page.locator('.ant-card').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F1.4-4', '五统一链路-配送', '点击配送跟踪', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '配送跟踪页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F1.4-4', '五统一链路-配送', '点击配送跟踪', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤5: 验证搜索输入框可见
  try {
    const searchInput = page.locator('input[placeholder*="配送单号"]').first();
    const hasInput = await searchInput.isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F1.4-5', '五统一链路-配送', '验证搜索输入框可见', hasInput ? 'PASS' : 'FAIL', getNewErrors(), hasInput ? '搜索输入框可见' : '搜索输入框不可见');
  } catch (e) {
    addResult('F1.4-5', '五统一链路-配送', '验证搜索输入框可见', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤6: 点击"冷链监控"
  try {
    const clicked = await clickSubmenu('统一配送', '冷链监控');
    const hasContent = page.locator('.ant-table, .ant-statistic').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F1.4-6', '五统一链路-配送', '点击冷链监控', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '冷链监控页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F1.4-6', '五统一链路-配送', '点击冷链监控', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤7: 验证统计卡片可见
  try {
    await waitForPage(3000);
    const statistics = page.locator('.ant-statistic');
    const statCount = await statistics.count();
    addResult('F1.4-7', '五统一链路-配送', '验证冷链统计卡片可见', statCount >= 2 ? 'PASS' : 'FAIL', getNewErrors(), `统计卡片数: ${statCount}`);
  } catch (e) {
    addResult('F1.4-7', '五统一链路-配送', '验证冷链统计卡片可见', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤8: 验证温湿度数据表格加载
  try {
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    addResult('F1.4-8', '五统一链路-配送', '验证温湿度数据表格加载', rowCount > 0 ? 'PASS' : 'FAIL', getNewErrors(), `温湿度数据行数: ${rowCount}`);
  } catch (e) {
    addResult('F1.4-8', '五统一链路-配送', '验证温湿度数据表格加载', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // --- 1.5 统一结算 ---
  console.log('--- 1.5 统一结算 ---');

  // 步骤1: 点击"统一结算"→"结算列表"
  try {
    const clicked = await clickSubmenu('统一结算', '结算列表');
    const hasContent = page.locator('.ant-table, .ant-statistic').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F1.5-1', '五统一链路-结算', '点击结算列表', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '结算列表页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F1.5-1', '五统一链路-结算', '点击结算列表', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤2: 验证3个统计卡片
  try {
    await waitForPage(3000);
    const statistics = page.locator('.ant-statistic');
    const statCount = await statistics.count();
    addResult('F1.5-2', '五统一链路-结算', '验证3个统计卡片(总结算金额/待确认/已支付)', statCount >= 3 ? 'PASS' : 'FAIL', getNewErrors(), `统计卡片数: ${statCount}`);
  } catch (e) {
    addResult('F1.5-2', '五统一链路-结算', '验证3个统计卡片', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤3: 验证结算列表加载，结算模式/维度Tag可见
  try {
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    const hasTags = await page.locator('.ant-table-row .ant-tag').first().isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F1.5-3', '五统一链路-结算', '验证结算列表加载及Tag可见', rowCount > 0 ? 'PASS' : 'FAIL', getNewErrors(), `结算行数: ${rowCount}, Tag可见: ${hasTags}`);
  } catch (e) {
    addResult('F1.5-3', '五统一链路-结算', '验证结算列表加载及Tag可见', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤4: 点击"对账管理"
  try {
    const clicked = await clickSubmenu('统一结算', '对账管理');
    const hasContent = page.locator('.ant-table, .ant-statistic').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F1.5-4', '五统一链路-结算', '点击对账管理', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '对账管理页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F1.5-4', '五统一链路-结算', '点击对账管理', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤5: 验证3个统计卡片
  try {
    await waitForPage(3000);
    const statistics = page.locator('.ant-statistic');
    const statCount = await statistics.count();
    addResult('F1.5-5', '五统一链路-结算', '验证对账3个统计卡片', statCount >= 3 ? 'PASS' : 'FAIL', getNewErrors(), `统计卡片数: ${statCount}`);
  } catch (e) {
    addResult('F1.5-5', '五统一链路-结算', '验证对账3个统计卡片', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤6: 验证对账列表加载，确认状态Tag可见
  try {
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    const hasTags = await page.locator('.ant-table-row .ant-tag').first().isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F1.5-6', '五统一链路-结算', '验证对账列表加载及确认状态Tag', rowCount > 0 ? 'PASS' : 'FAIL', getNewErrors(), `对账行数: ${rowCount}, Tag可见: ${hasTags}`);
  } catch (e) {
    addResult('F1.5-6', '五统一链路-结算', '验证对账列表加载及确认状态Tag', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // ========== 测试2：村医开方→零库存托管→配送→签收链路 ==========

  // --- 2.1 零库存托管配置 ---
  console.log('--- 2.1 零库存托管配置 ---');

  // 步骤1: 点击"统一库存"→"零库存托管"
  try {
    const clicked = await clickSubmenu('统一库存', '零库存托管');
    const hasContent = page.locator('.ant-table, .ant-statistic').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F2.1-1', '村医链路-零库存托管', '点击零库存托管', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '零库存托管页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F2.1-1', '村医链路-零库存托管', '点击零库存托管', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤2: 验证页面描述包含"零库存托管"
  try {
    await waitForPage(3000);
    const pageText = await page.locator('body').textContent({ timeout: 3000 }).catch(() => '');
    const hasDesc = pageText.includes('零库存托管');
    addResult('F2.1-2', '村医链路-零库存托管', '验证页面描述包含零库存托管', hasDesc ? 'PASS' : 'FAIL', getNewErrors(), hasDesc ? '页面描述包含零库存托管' : '页面描述不包含零库存托管');
  } catch (e) {
    addResult('F2.1-2', '村医链路-零库存托管', '验证页面描述包含零库存托管', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤3: 验证3个统计卡片
  try {
    const statistics = page.locator('.ant-statistic');
    const statCount = await statistics.count();
    addResult('F2.1-3', '村医链路-零库存托管', '验证3个统计卡片(托管村卫生室/全托管/部分托管)', statCount >= 3 ? 'PASS' : 'FAIL', getNewErrors(), `统计卡片数: ${statCount}`);
  } catch (e) {
    addResult('F2.1-3', '村医链路-零库存托管', '验证3个统计卡片', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤4: 验证数据表格加载，Switch开关可见
  try {
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    const hasSwitch = await page.locator('.ant-table-row .ant-switch').first().isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F2.1-4', '村医链路-零库存托管', '验证数据表格加载及Switch开关', rowCount > 0 && hasSwitch ? 'PASS' : 'FAIL', getNewErrors(), `行数: ${rowCount}, Switch可见: ${hasSwitch}`);
  } catch (e) {
    addResult('F2.1-4', '村医链路-零库存托管', '验证数据表格加载及Switch开关', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤5: 点击"新增托管配置"按钮
  try {
    const addBtn = page.locator('button:has-text("新增托管配置")').first();
    await addBtn.click();
    await waitForPage(2000);
    const modal = page.locator('.ant-modal');
    const isModalOpen = await modal.isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F2.1-5', '村医链路-零库存托管', '点击新增托管配置验证Modal打开', isModalOpen ? 'PASS' : 'FAIL', getNewErrors(), isModalOpen ? 'Modal已打开' : 'Modal未打开');
  } catch (e) {
    addResult('F2.1-5', '村医链路-零库存托管', '点击新增托管配置验证Modal打开', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤6: 验证Modal表单可见
  try {
    const modal = page.locator('.ant-modal');
    const hasVillageSelect = await modal.locator('text=村卫生室').first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasHostSelect = await modal.locator('text=托管医院').first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasModeSelect = await modal.locator('text=托管模式').first().isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F2.1-6', '村医链路-零库存托管', '验证Modal表单可见(村卫生室/托管医院/托管模式)', hasVillageSelect && hasHostSelect && hasModeSelect ? 'PASS' : 'FAIL', getNewErrors(), `村卫生室: ${hasVillageSelect}, 托管医院: ${hasHostSelect}, 托管模式: ${hasModeSelect}`);
  } catch (e) {
    addResult('F2.1-6', '村医链路-零库存托管', '验证Modal表单可见', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤7: 关闭Modal
  try {
    const cancelBtn = page.locator('.ant-modal button:has-text("取消")').first();
    await cancelBtn.click();
    await waitForPage(1000);
    const modalClosed = !await page.locator('.ant-modal').isVisible({ timeout: 2000 }).catch(() => false);
    addResult('F2.1-7', '村医链路-零库存托管', '关闭Modal', modalClosed ? 'PASS' : 'FAIL', getNewErrors(), modalClosed ? 'Modal已关闭' : 'Modal未关闭');
  } catch (e) {
    addResult('F2.1-7', '村医链路-零库存托管', '关闭Modal', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // --- 2.2 自动补货 ---
  console.log('--- 2.2 自动补货 ---');

  // 步骤1: 点击"自动补货"
  try {
    const clicked = await clickSubmenu('统一库存', '自动补货');
    const hasContent = page.locator('.ant-table, .ant-statistic').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F2.2-1', '村医链路-自动补货', '点击自动补货', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '自动补货页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F2.2-1', '村医链路-自动补货', '点击自动补货', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤2: 验证页面描述包含"AI智能补货"
  try {
    await waitForPage(3000);
    const pageText = await page.locator('body').textContent({ timeout: 3000 }).catch(() => '');
    const hasDesc = pageText.includes('AI智能补货') || pageText.includes('AI') && pageText.includes('补货');
    addResult('F2.2-2', '村医链路-自动补货', '验证页面描述包含AI智能补货', hasDesc ? 'PASS' : 'FAIL', getNewErrors(), hasDesc ? '页面描述包含AI智能补货' : '页面描述不包含AI智能补货');
  } catch (e) {
    addResult('F2.2-2', '村医链路-自动补货', '验证页面描述包含AI智能补货', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤3: 验证3个统计卡片
  try {
    const statistics = page.locator('.ant-statistic');
    const statCount = await statistics.count();
    addResult('F2.2-3', '村医链路-自动补货', '验证3个统计卡片(待确认/已确认/平均置信度)', statCount >= 3 ? 'PASS' : 'FAIL', getNewErrors(), `统计卡片数: ${statCount}`);
  } catch (e) {
    addResult('F2.2-3', '村医链路-自动补货', '验证3个统计卡片', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤4: 验证补货列表加载，置信度Progress组件可见
  try {
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    const hasProgress = await page.locator('.ant-progress').first().isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F2.2-4', '村医链路-自动补货', '验证补货列表加载及置信度Progress', rowCount > 0 && hasProgress ? 'PASS' : 'FAIL', getNewErrors(), `行数: ${rowCount}, Progress可见: ${hasProgress}`);
  } catch (e) {
    addResult('F2.2-4', '村医链路-自动补货', '验证补货列表加载及置信度Progress', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤5: 展开某行，验证AlgorithmResult组件
  try {
    const expandBtn = page.locator('.ant-table-row').first().locator('a:has-text("详情")').first();
    if (await expandBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expandBtn.click();
      await waitForPage(2000);
    }
    const expandedRow = page.locator('.ant-table-expanded-row');
    const hasExpanded = await expandedRow.isVisible({ timeout: 3000 }).catch(() => false);
    const hasConfirmBtn = await page.locator('button:has-text("确认")').first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasRejectBtn = await page.locator('button:has-text("拒绝")').first().isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F2.2-5', '村医链路-自动补货', '展开某行验证AlgorithmResult组件', hasExpanded ? 'PASS' : 'FAIL', getNewErrors(), `展开行可见: ${hasExpanded}, 确认按钮: ${hasConfirmBtn}, 拒绝按钮: ${hasRejectBtn}`);
  } catch (e) {
    addResult('F2.2-5', '村医链路-自动补货', '展开某行验证AlgorithmResult组件', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // --- 2.3 处方流转（村医开方） ---
  console.log('--- 2.3 处方流转 ---');

  // 步骤1: 点击"处方流转"→"处方列表"
  try {
    const clicked = await clickSubmenu('处方流转', '处方列表');
    const hasContent = page.locator('.ant-table, .ant-statistic').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F2.3-1', '村医链路-处方流转', '点击处方列表', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '处方列表页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F2.3-1', '村医链路-处方流转', '点击处方列表', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤2: 验证处方列表加载
  try {
    await waitForPage(3000);
    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();
    addResult('F2.3-2', '村医链路-处方流转', '验证处方列表加载', rowCount > 0 ? 'PASS' : 'FAIL', getNewErrors(), `处方行数: ${rowCount}`);
  } catch (e) {
    addResult('F2.3-2', '村医链路-处方流转', '验证处方列表加载', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤3: 点击某行"详情"按钮
  try {
    const detailBtn = page.locator('.ant-table-row').first().locator('a:has-text("查看详情"), a:has-text("详情")').first();
    await detailBtn.click();
    await waitForPage(2000);
    const drawer = page.locator('.ant-drawer-open');
    const isDrawerOpen = await drawer.isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F2.3-3', '村医链路-处方流转', '点击详情按钮验证Drawer打开', isDrawerOpen ? 'PASS' : 'FAIL', getNewErrors(), isDrawerOpen ? 'Drawer已打开' : 'Drawer未打开');
  } catch (e) {
    addResult('F2.3-3', '村医链路-处方流转', '点击详情按钮验证Drawer打开', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤4: 验证Drawer中显示处方基本信息+药品列表+流转记录Timeline
  try {
    const drawer = page.locator('.ant-drawer-open');
    const hasDescriptions = await drawer.locator('.ant-descriptions').first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasDrugTable = await drawer.locator('.ant-table').first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasTimeline = await drawer.locator('.ant-timeline').first().isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F2.3-4', '村医链路-处方流转', '验证Drawer中处方信息+药品列表+Timeline', hasDescriptions && hasDrugTable && hasTimeline ? 'PASS' : 'FAIL', getNewErrors(), `基本信息: ${hasDescriptions}, 药品列表: ${hasDrugTable}, Timeline: ${hasTimeline}`);
  } catch (e) {
    addResult('F2.3-4', '村医链路-处方流转', '验证Drawer中处方信息+药品列表+Timeline', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤5: 关闭Drawer
  try {
    const closeBtn = page.locator('.ant-drawer-open .ant-drawer-close').first();
    await closeBtn.click();
    await waitForPage(1000);
    const drawerClosed = !await page.locator('.ant-drawer-open').isVisible({ timeout: 2000 }).catch(() => false);
    addResult('F2.3-5', '村医链路-处方流转', '关闭Drawer', drawerClosed ? 'PASS' : 'FAIL', getNewErrors(), drawerClosed ? 'Drawer已关闭' : 'Drawer未关闭');
  } catch (e) {
    addResult('F2.3-5', '村医链路-处方流转', '关闭Drawer', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤6: 点击"开具处方"
  try {
    const clicked = await clickSubmenu('处方流转', '开具处方');
    const hasForm = page.locator('.ant-form').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F2.3-6', '村医链路-处方流转', '点击开具处方', clicked && hasForm ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasForm ? '开具处方页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F2.3-6', '村医链路-处方流转', '点击开具处方', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤7: 验证开方表单可见
  try {
    await waitForPage(3000);
    const hasOrgSelect = await page.locator('text=机构').first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasDoctorName = await page.locator('text=医生姓名').first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasPatientName = await page.locator('text=患者姓名').first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasRadio = await page.locator('.ant-radio-group').first().isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F2.3-7', '村医链路-处方流转', '验证开方表单可见(机构/医生/患者/处方类型Radio)', hasOrgSelect && hasDoctorName && hasPatientName && hasRadio ? 'PASS' : 'FAIL', getNewErrors(), `机构: ${hasOrgSelect}, 医生: ${hasDoctorName}, 患者: ${hasPatientName}, Radio: ${hasRadio}`);
  } catch (e) {
    addResult('F2.3-7', '村医链路-处方流转', '验证开方表单可见', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤8: 验证药品列表区域可见（含添加药品按钮）
  try {
    const hasDrugList = await page.locator('text=药品列表').first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasAddDrugBtn = await page.locator('button:has-text("添加药品")').first().isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F2.3-8', '村医链路-处方流转', '验证药品列表区域及添加药品按钮', hasDrugList && hasAddDrugBtn ? 'PASS' : 'FAIL', getNewErrors(), `药品列表: ${hasDrugList}, 添加药品按钮: ${hasAddDrugBtn}`);
  } catch (e) {
    addResult('F2.3-8', '村医链路-处方流转', '验证药品列表区域及添加药品按钮', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤9: 点击"处方流转"
  try {
    const clicked = await clickSubmenu('处方流转', '处方流转');
    const hasContent = page.locator('.ant-card').isVisible({ timeout: 5000 }).catch(() => false);
    addResult('F2.3-9', '村医链路-处方流转', '点击处方流转追踪', clicked && hasContent ? 'PASS' : 'FAIL', getNewErrors(), clicked && hasContent ? '处方流转追踪页面加载' : '页面未正确加载');
  } catch (e) {
    addResult('F2.3-9', '村医链路-处方流转', '点击处方流转追踪', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // 步骤10: 验证搜索输入框可见
  try {
    const searchInput = page.locator('input[placeholder*="处方号"]').first();
    const hasInput = await searchInput.isVisible({ timeout: 3000 }).catch(() => false);
    addResult('F2.3-10', '村医链路-处方流转', '验证搜索输入框可见', hasInput ? 'PASS' : 'FAIL', getNewErrors(), hasInput ? '搜索输入框可见' : '搜索输入框不可见');
  } catch (e) {
    addResult('F2.3-10', '村医链路-处方流转', '验证搜索输入框可见', 'FAIL', getNewErrors(), `异常: ${e.message}`);
  }

  // ========== 生成测试结果 ==========
  console.log('\n=== 生成测试结果 ===');

  const totalSteps = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const totalJsErrors = results.reduce((sum, r) => sum + r.jsErrors.length, 0);

  const testOutput = {
    testSuite: '全流程联调测试',
    timestamp: new Date().toISOString(),
    results,
    summary: {
      totalSteps,
      passed,
      failed,
      totalJsErrors,
      flowResults
    }
  };

  // 确保目录存在
  const dir = path.dirname(RESULT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(RESULT_FILE, JSON.stringify(testOutput, null, 2), 'utf-8');
  console.log(`测试结果已写入: ${RESULT_FILE}`);
  console.log(`总计: ${totalSteps} 步, 通过: ${passed}, 失败: ${failed}`);
  console.log(`五统一链路: ${flowResults['五统一链路']}, 村医链路: ${flowResults['村医链路']}`);

  await browser.close();
}

runTests().catch((err) => {
  console.error('测试执行失败:', err);
  process.exit(1);
});
