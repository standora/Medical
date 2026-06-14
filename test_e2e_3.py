"""
医共体智慧药房协同平台 E2E 测试 - 处方+质控+统计+全链路
使用 Playwright sync API
"""
import json
import os
import time
from datetime import datetime
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
SCREENSHOT_DIR = r"d:\Demo\medical\test-results"
RESULT_FILE = os.path.join(SCREENSHOT_DIR, "result-3.json")

results = []


def add_result(test_id: str, module: str, step: str, status: str, detail: str):
    results.append({
        "testId": test_id,
        "module": module,
        "step": step,
        "status": status,
        "detail": detail,
    })


def take_screenshot(page, name: str):
    try:
        path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
        page.screenshot(path=path, full_page=False)
    except Exception:
        pass


def safe_step(test_id: str, module: str, step: str, func):
    """执行单个测试步骤，失败时记录但继续"""
    try:
        func()
        add_result(test_id, module, step, "PASS", f"{step} 成功")
    except Exception as e:
        add_result(test_id, module, step, "FAIL", f"{step} 失败: {str(e)[:200]}")


def wait_for_page(page, timeout=8000):
    """等待页面基本加载完成"""
    try:
        page.wait_for_load_state("networkidle", timeout=timeout)
    except Exception:
        pass
    time.sleep(0.5)


def login_as_admin(page):
    """登录管理员角色"""
    page.goto(BASE_URL + "/login", timeout=15000)
    wait_for_page(page)
    admin_card = page.locator("text=管理员").first
    admin_card.wait_for(state="visible", timeout=10000)
    admin_card.click()
    wait_for_page(page)
    page.wait_for_url("**/dashboard**", timeout=10000)
    take_screenshot(page, "login_admin")


def navigate_via_sidebar(page, path: str):
    """
    通过侧边栏导航到指定路径。
    先尝试侧边栏点击，如果失败则使用URL导航（并处理登录重定向）。
    导航后等待页面内容渲染完成。
    """
    # 菜单路径映射：URL路径 -> (父菜单标签, 子菜单标签) 或 (菜单标签, None)
    menu_map = {
        "/dashboard": ("首页总览", None),
        "/catalog": ("统一用药目录", None),
        "/purchase/plan": ("统一采购", "采购计划"),
        "/purchase/order": ("统一采购", "采购订单"),
        "/purchase/centralized": ("统一采购", "集采统计"),
        "/inventory/overview": ("统一库存", "库存总览"),
        "/inventory/alert": ("统一库存", "库存预警"),
        "/inventory/transfer": ("统一库存", "库存调剂"),
        "/inventory/zero": ("统一库存", "零库存托管"),
        "/inventory/replenishment": ("统一库存", "自动补货"),
        "/delivery/list": ("统一配送", "配送列表"),
        "/delivery/track": ("统一配送", "配送跟踪"),
        "/delivery/cold-chain": ("统一配送", "冷链监控"),
        "/settlement/list": ("统一结算", "结算列表"),
        "/settlement/reconciliation": ("统一结算", "对账管理"),
        "/prescription/list": ("处方流转", "处方列表"),
        "/prescription/create": ("处方流转", "开具处方"),
        "/prescription/flow": ("处方流转", "处方流转"),
        "/quality/interaction": ("药事质控", "合理用药"),
        "/quality/trace": ("药事质控", "药品追溯"),
        "/stats": ("统计分析", None),
    }

    menu_info = menu_map.get(path)
    if not menu_info:
        page.goto(BASE_URL + path, timeout=15000)
        _wait_for_content(page)
        return

    label, sublabel = menu_info

    try:
        if sublabel is None:
            item = page.locator(f"xpath=//li[contains(@class,'ant-menu-item') and not(contains(@class,'ant-menu-submenu')) and normalize-space(.)='{label}']").first
            item.wait_for(state="visible", timeout=5000)
            item.click()
        else:
            # 先检查子菜单是否已展开，如果没有则点击展开
            submenu = page.locator(f"xpath=//li[contains(@class,'ant-menu-submenu') and contains(.,'{label}')]").first
            submenu.wait_for(state="visible", timeout=5000)
            is_open = "ant-menu-submenu-open" in (submenu.get_attribute("class") or "")
            if not is_open:
                parent = page.locator(f"xpath=//li[contains(@class,'ant-menu-submenu')]//div[contains(@class,'ant-menu-submenu-title') and contains(.,'{label}')]").first
                parent.click()
                time.sleep(0.5)

            child = page.locator(f"xpath=//li[contains(@class,'ant-menu-item') and not(contains(@class,'ant-menu-submenu')) and normalize-space(.)='{sublabel}']").first
            child.wait_for(state="visible", timeout=5000)
            child.click()
    except Exception:
        # 侧边栏点击失败，使用URL导航作为回退
        page.goto(BASE_URL + path, timeout=15000)
        if "/login" in page.url:
            login_as_admin(page)
            page.goto(BASE_URL + path, timeout=15000)

    # 等待页面内容渲染（懒加载组件需要时间）
    _wait_for_content(page)


def _wait_for_content(page, timeout=10000):
    """等待页面内容渲染完成（懒加载的React组件需要额外等待）"""
    # 先等待一小段时间让React完成路由切换和卸载旧组件
    time.sleep(1)
    try:
        page.locator(".ant-card, .ant-table, .ant-form, .ant-page-header, .ant-statistic, .ant-input, .ant-tabs").first.wait_for(state="visible", timeout=timeout)
    except Exception:
        # 如果上述元素都没找到，至少等待网络空闲
        try:
            page.wait_for_load_state("networkidle", timeout=5000)
        except Exception:
            pass
    time.sleep(0.5)


# ============================================================
# 测试8: 处方流转
# ============================================================
def test_8_prescription(page):
    module = "处方流转"

    # 8.1 点击侧边栏"处方流转"展开子菜单，点击"处方列表"
    def step_8_1():
        navigate_via_sidebar(page, "/prescription/list")
        take_screenshot(page, "8_1_prescription_list")

    safe_step("8.1", module, "点击处方列表", step_8_1)

    # 8.2 验证处方列表页面加载，统计卡片可见
    def step_8_2():
        stat_cards = page.locator(".ant-statistic")
        count = stat_cards.count()
        assert count > 0, f"统计卡片数量为 {count}"
        take_screenshot(page, "8_2_stat_cards")

    safe_step("8.2", module, "验证统计卡片可见", step_8_2)

    # 8.3 验证处方类型Tag可见（西药/中药）
    def step_8_3():
        tag_found = False
        tags = page.locator(".ant-tag")
        for i in range(min(tags.count(), 50)):
            text = tags.nth(i).inner_text()
            if text.strip() in ("西药", "中药"):
                tag_found = True
                break
        assert tag_found, "未找到西药/中药处方类型Tag"
        take_screenshot(page, "8_3_prescription_type_tag")

    safe_step("8.3", module, "验证处方类型Tag可见", step_8_3)

    # 8.4 验证状态Tag可见
    def step_8_4():
        status_tags = page.locator(".ant-tag")
        assert status_tags.count() > 0, "未找到状态Tag"
        take_screenshot(page, "8_4_status_tag")

    safe_step("8.4", module, "验证状态Tag可见", step_8_4)

    # 8.5 点击某行的"查看详情"按钮
    def step_8_5():
        detail_link = page.locator("a:has-text('查看详情')").first
        detail_link.wait_for(state="visible", timeout=8000)
        detail_link.click()
        time.sleep(1)
        take_screenshot(page, "8_5_click_detail")

    safe_step("8.5", module, "点击查看详情", step_8_5)

    # 8.6 验证Drawer打开，显示处方详情
    def step_8_6():
        drawer = page.locator(".ant-drawer-open").first
        drawer.wait_for(state="visible", timeout=8000)
        assert drawer.is_visible(), "Drawer未打开"
        take_screenshot(page, "8_6_drawer_open")

    safe_step("8.6", module, "验证Drawer打开", step_8_6)

    # 8.7 验证处方药品列表表格可见
    def step_8_7():
        drawer_body = page.locator(".ant-drawer-body")
        tables = drawer_body.locator(".ant-table")
        assert tables.count() > 0, "Drawer中未找到药品列表表格"
        take_screenshot(page, "8_7_drug_table")

    safe_step("8.7", module, "验证处方药品列表表格可见", step_8_7)

    # 8.8 验证流转记录Timeline可见
    def step_8_8():
        drawer_body = page.locator(".ant-drawer-body")
        timeline = drawer_body.locator(".ant-timeline")
        assert timeline.count() > 0, "Drawer中未找到流转记录Timeline"
        take_screenshot(page, "8_8_timeline")

    safe_step("8.8", module, "验证流转记录Timeline可见", step_8_8)

    # 8.9 关闭Drawer
    def step_8_9():
        close_btn = page.locator(".ant-drawer-close").first
        close_btn.click()
        time.sleep(0.5)
        take_screenshot(page, "8_9_drawer_closed")

    safe_step("8.9", module, "关闭Drawer", step_8_9)

    # 8.10 点击"开具处方"
    def step_8_10():
        navigate_via_sidebar(page, "/prescription/create")
        take_screenshot(page, "8_10_prescription_create")

    safe_step("8.10", module, "点击开具处方", step_8_10)

    # 8.11 验证开方页面加载，表单可见
    def step_8_11():
        form = page.locator(".ant-form")
        form.wait_for(state="visible", timeout=8000)
        assert form.is_visible(), "开方页面表单不可见"
        take_screenshot(page, "8_11_create_form")

    safe_step("8.11", module, "验证开方页面表单可见", step_8_11)

    # 8.12 验证机构选择器可见
    def step_8_12():
        org_select = page.locator(".ant-form-item").filter(has_text="机构").first
        assert org_select.is_visible(), "机构选择器不可见"
        take_screenshot(page, "8_12_org_select")

    safe_step("8.12", module, "验证机构选择器可见", step_8_12)

    # 8.13 验证处方类型Radio可见
    def step_8_13():
        radio = page.locator(".ant-radio-group")
        radio.wait_for(state="visible", timeout=5000)
        assert radio.is_visible(), "处方类型Radio不可见"
        take_screenshot(page, "8_13_prescription_type_radio")

    safe_step("8.13", module, "验证处方类型Radio可见", step_8_13)

    # 8.14 验证药品列表区域可见（含添加药品按钮）
    def step_8_14():
        add_drug_btn = page.locator("text=添加药品").first
        add_drug_btn.wait_for(state="visible", timeout=5000)
        assert add_drug_btn.is_visible(), "添加药品按钮不可见"
        take_screenshot(page, "8_14_drug_list_area")

    safe_step("8.14", module, "验证药品列表区域可见", step_8_14)

    # 8.15 点击"处方流转"子菜单（流转追踪页面）
    def step_8_15():
        navigate_via_sidebar(page, "/prescription/flow")
        take_screenshot(page, "8_15_prescription_flow")

    safe_step("8.15", module, "点击处方流转追踪", step_8_15)

    # 8.16 验证处方流转追踪页面加载
    def step_8_16():
        page_header = page.locator("text=处方流转追踪").first
        page_header.wait_for(state="visible", timeout=8000)
        assert page_header.is_visible(), "处方流转追踪页面未加载"
        take_screenshot(page, "8_16_flow_page")

    safe_step("8.16", module, "验证处方流转追踪页面加载", step_8_16)

    # 8.17 验证搜索输入框可见
    def step_8_17():
        search_input = page.locator(".ant-input").first
        search_input.wait_for(state="visible", timeout=5000)
        assert search_input.is_visible(), "搜索输入框不可见"
        take_screenshot(page, "8_17_search_input")

    safe_step("8.17", module, "验证搜索输入框可见", step_8_17)


# ============================================================
# 测试9: 药事质控
# ============================================================
def test_9_quality(page):
    module = "药事质控"

    # 9.1 点击"合理用药"
    def step_9_1():
        navigate_via_sidebar(page, "/quality/interaction")
        take_screenshot(page, "9_1_drug_interaction")

    safe_step("9.1", module, "点击合理用药", step_9_1)

    # 9.2 验证合理用药页面加载，统计卡片可见
    def step_9_2():
        stat_cards = page.locator(".ant-statistic")
        count = stat_cards.count()
        assert count > 0, f"统计卡片数量为 {count}"
        take_screenshot(page, "9_2_stat_cards")

    safe_step("9.2", module, "验证统计卡片可见", step_9_2)

    # 9.3 验证规则类型Tag可见
    def step_9_3():
        tags = page.locator(".ant-tag")
        type_labels = ["禁忌", "剂量", "重复用药", "配伍禁忌"]
        found = False
        for i in range(min(tags.count(), 50)):
            text = tags.nth(i).inner_text()
            if text.strip() in type_labels:
                found = True
                break
        assert found, "未找到规则类型Tag"
        take_screenshot(page, "9_3_rule_type_tag")

    safe_step("9.3", module, "验证规则类型Tag可见", step_9_3)

    # 9.4 验证拦截级别Tag可见
    def step_9_4():
        tags = page.locator(".ant-tag")
        level_labels = ["警告", "阻断"]
        found = False
        for i in range(min(tags.count(), 50)):
            text = tags.nth(i).inner_text()
            if text.strip() in level_labels:
                found = True
                break
        assert found, "未找到拦截级别Tag"
        take_screenshot(page, "9_4_intercept_level_tag")

    safe_step("9.4", module, "验证拦截级别Tag可见", step_9_4)

    # 9.5 验证Switch开关可见
    def step_9_5():
        switches = page.locator(".ant-switch")
        assert switches.count() > 0, "未找到Switch开关"
        take_screenshot(page, "9_5_switch")

    safe_step("9.5", module, "验证Switch开关可见", step_9_5)

    # 9.6 点击"药品追溯"
    def step_9_6():
        navigate_via_sidebar(page, "/quality/trace")
        take_screenshot(page, "9_6_drug_trace")

    safe_step("9.6", module, "点击药品追溯", step_9_6)

    # 9.7 验证药品追溯页面加载
    def step_9_7():
        page_header = page.locator("text=药品追溯").first
        page_header.wait_for(state="visible", timeout=8000)
        assert page_header.is_visible(), "药品追溯页面未加载"
        take_screenshot(page, "9_7_trace_page")

    safe_step("9.7", module, "验证药品追溯页面加载", step_9_7)

    # 9.8 验证搜索区域可见
    def step_9_8():
        search_form = page.locator(".ant-form").first
        search_form.wait_for(state="visible", timeout=5000)
        assert search_form.is_visible(), "搜索区域不可见"
        take_screenshot(page, "9_8_search_area")

    safe_step("9.8", module, "验证搜索区域可见", step_9_8)

    # 9.9 验证数据表格可见
    def step_9_9():
        table = page.locator(".ant-table").first
        table.wait_for(state="visible", timeout=8000)
        assert table.is_visible(), "数据表格不可见"
        take_screenshot(page, "9_9_data_table")

    safe_step("9.9", module, "验证数据表格可见", step_9_9)


# ============================================================
# 测试11: 全链路业务流程验证
# ============================================================
def test_11_full_chain(page):
    module = "全链路业务流程"

    # 11.1 统一用药目录 → 统一采购 → 统一库存 → 统一配送 → 统一结算
    chain_pages_1 = [
        ("/catalog", "统一用药目录"),
        ("/purchase/plan", "统一采购"),
        ("/inventory/overview", "统一库存"),
        ("/delivery/list", "统一配送"),
        ("/settlement/list", "统一结算"),
    ]

    for idx, (path, label) in enumerate(chain_pages_1):
        def make_step(p=path, lbl=label, i=idx):
            def step():
                navigate_via_sidebar(page, p)
                content = page.locator(".ant-card, .ant-table, .ant-page-header, h2, h4").first
                content.wait_for(state="visible", timeout=10000)
                take_screenshot(page, f"11_1_chain_{i}_{lbl}")
            return step
        safe_step(f"11.1.{idx+1}", module, f"验证{label}页面可达", make_step())

    # 11.2 核心杀手功能链路：零库存托管 → 自动补货 → 库存预警
    chain_pages_2 = [
        ("/inventory/zero", "零库存托管"),
        ("/inventory/replenishment", "自动补货"),
        ("/inventory/alert", "库存预警"),
    ]

    for idx, (path, label) in enumerate(chain_pages_2):
        def make_step2(p=path, lbl=label, i=idx):
            def step():
                navigate_via_sidebar(page, p)
                content = page.locator(".ant-card, .ant-table, .ant-page-header, h2, h4").first
                content.wait_for(state="visible", timeout=10000)
                take_screenshot(page, f"11_2_killer_{i}_{lbl}")
            return step
        safe_step(f"11.2.{idx+1}", module, f"验证{label}页面可达", make_step2())

    # 11.3 处方流转链路：处方列表 → 开具处方 → 处方流转追踪
    chain_pages_3 = [
        ("/prescription/list", "处方列表"),
        ("/prescription/create", "开具处方"),
        ("/prescription/flow", "处方流转追踪"),
    ]

    for idx, (path, label) in enumerate(chain_pages_3):
        def make_step3(p=path, lbl=label, i=idx):
            def step():
                navigate_via_sidebar(page, p)
                content = page.locator(".ant-card, .ant-table, .ant-page-header, h2, h4").first
                content.wait_for(state="visible", timeout=10000)
                take_screenshot(page, f"11_3_prescription_{i}_{lbl}")
            return step
        safe_step(f"11.3.{idx+1}", module, f"验证{label}页面可达", make_step3())

    # 11.4 药事质控链路：合理用药规则 → 药品追溯
    chain_pages_4 = [
        ("/quality/interaction", "合理用药规则"),
        ("/quality/trace", "药品追溯"),
    ]

    for idx, (path, label) in enumerate(chain_pages_4):
        def make_step4(p=path, lbl=label, i=idx):
            def step():
                navigate_via_sidebar(page, p)
                content = page.locator(".ant-card, .ant-table, .ant-page-header, h2, h4").first
                content.wait_for(state="visible", timeout=10000)
                take_screenshot(page, f"11_4_quality_{i}_{lbl}")
            return step
        safe_step(f"11.4.{idx+1}", module, f"验证{label}页面可达", make_step4())


# ============================================================
# 测试9续: 统计分析
# ============================================================
def test_9x_stats(page):
    module = "统计分析"

    # 9x.1 点击侧边栏"统计分析"
    def step_9x_1():
        navigate_via_sidebar(page, "/stats")
        take_screenshot(page, "9x_1_stats_page")

    safe_step("9x.1", module, "点击统计分析", step_9x_1)

    # 9x.2 验证统计分析页面加载
    def step_9x_2():
        page_header = page.locator("text=统计分析").first
        page_header.wait_for(state="visible", timeout=8000)
        assert page_header.is_visible(), "统计分析页面未加载"
        take_screenshot(page, "9x_2_stats_loaded")

    safe_step("9x.2", module, "验证统计分析页面加载", step_9x_2)

    # 9x.3 验证4个Tab可见
    def step_9x_3():
        tabs = page.locator(".ant-tabs-tab")
        tab_count = tabs.count()
        assert tab_count >= 4, f"Tab数量为 {tab_count}，期望至少4个"
        tab_labels = []
        for i in range(tab_count):
            tab_labels.append(tabs.nth(i).inner_text())
        expected = ["采购统计", "库存统计", "配送统计", "处方统计"]
        for exp_label in expected:
            assert exp_label in tab_labels, f"未找到Tab: {exp_label}"
        take_screenshot(page, "9x_3_tabs")

    safe_step("9x.3", module, "验证4个Tab可见", step_9x_3)

    # 9x.4 验证默认Tab（采购统计）内容可见
    def step_9x_4():
        active_tab = page.locator(".ant-tabs-tabpane-active").first
        assert active_tab.is_visible(), "默认Tab内容不可见"
        stat = active_tab.locator(".ant-statistic").first
        stat.wait_for(state="visible", timeout=5000)
        take_screenshot(page, "9x_4_purchase_tab")

    safe_step("9x.4", module, "验证采购统计内容可见", step_9x_4)

    # 9x.5 切换到"库存统计"Tab
    def step_9x_5():
        tab = page.locator(".ant-tabs-tab").filter(has_text="库存统计").first
        tab.click()
        time.sleep(0.8)
        take_screenshot(page, "9x_5_inventory_tab")

    safe_step("9x.5", module, "切换到库存统计Tab", step_9x_5)

    # 9x.6 验证库存统计内容可见
    def step_9x_6():
        active_tab = page.locator(".ant-tabs-tabpane-active").first
        stat = active_tab.locator(".ant-statistic").first
        stat.wait_for(state="visible", timeout=5000)
        assert stat.is_visible(), "库存统计内容不可见"
        take_screenshot(page, "9x_6_inventory_content")

    safe_step("9x.6", module, "验证库存统计内容可见", step_9x_6)

    # 9x.7 切换到"配送统计"Tab
    def step_9x_7():
        tab = page.locator(".ant-tabs-tab").filter(has_text="配送统计").first
        tab.click()
        time.sleep(0.8)
        take_screenshot(page, "9x_7_delivery_tab")

    safe_step("9x.7", module, "切换到配送统计Tab", step_9x_7)

    # 9x.8 验证配送统计内容可见
    def step_9x_8():
        active_tab = page.locator(".ant-tabs-tabpane-active").first
        stat = active_tab.locator(".ant-statistic").first
        stat.wait_for(state="visible", timeout=5000)
        assert stat.is_visible(), "配送统计内容不可见"
        take_screenshot(page, "9x_8_delivery_content")

    safe_step("9x.8", module, "验证配送统计内容可见", step_9x_8)

    # 9x.9 切换到"处方统计"Tab
    def step_9x_9():
        tab = page.locator(".ant-tabs-tab").filter(has_text="处方统计").first
        tab.click()
        time.sleep(0.8)
        take_screenshot(page, "9x_9_prescription_tab")

    safe_step("9x.9", module, "切换到处方统计Tab", step_9x_9)

    # 9x.10 验证处方统计内容可见
    def step_9x_10():
        active_tab = page.locator(".ant-tabs-tabpane-active").first
        stat = active_tab.locator(".ant-statistic").first
        stat.wait_for(state="visible", timeout=5000)
        assert stat.is_visible(), "处方统计内容不可见"
        take_screenshot(page, "9x_10_prescription_content")

    safe_step("9x.10", module, "验证处方统计内容可见", step_9x_10)


# ============================================================
# 主函数
# ============================================================
def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        page.set_default_timeout(15000)
        page.set_default_navigation_timeout(20000)

        try:
            # 登录
            login_as_admin(page)

            # 测试8: 处方流转
            test_8_prescription(page)

            # 测试9: 药事质控
            test_9_quality(page)

            # 测试11: 全链路业务流程验证
            test_11_full_chain(page)

            # 测试9续: 统计分析
            test_9x_stats(page)

        except Exception as e:
            add_result("0.0", "全局", "测试执行异常", "FAIL", str(e)[:300])
        finally:
            take_screenshot(page, "final_state")
            browser.close()

    # 汇总结果
    total = len(results)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")

    output = {
        "testSuite": "处方+质控+统计+全链路",
        "timestamp": datetime.now().isoformat(),
        "results": results,
        "summary": {
            "total": total,
            "passed": passed,
            "failed": failed,
        },
    }

    os.makedirs(os.path.dirname(RESULT_FILE), exist_ok=True)
    with open(RESULT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"测试完成！总计: {total}, 通过: {passed}, 失败: {failed}")
    print(f"结果文件: {RESULT_FILE}")
    print(f"{'='*60}")

    if failed > 0:
        print("\n失败项:")
        for r in results:
            if r["status"] == "FAIL":
                print(f"  [{r['testId']}] {r['module']} - {r['step']}: {r['detail']}")


if __name__ == "__main__":
    main()
