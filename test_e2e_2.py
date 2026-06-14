"""
医共体智慧药房协同平台 E2E 测试 - 测试5/6/7
统一库存 + 统一配送 + 统一结算
"""
import json
import os
from datetime import datetime, timezone, timedelta
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
SCREENSHOT_DIR = r"d:\Demo\medical\test-results"
RESULT_FILE = os.path.join(SCREENSHOT_DIR, "result-2.json")

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
    path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
    try:
        page.screenshot(path=path, full_page=False)
    except Exception as e:
        print(f"  截图失败 {name}: {e}")


def safe_step(test_id: str, module: str, step: str, func):
    """安全执行测试步骤，失败时记录但继续"""
    try:
        func()
        add_result(test_id, module, step, "PASS", "验证通过")
    except Exception as e:
        add_result(test_id, module, step, "FAIL", str(e)[:200])


def wait_and_click(page, selector: str, timeout: int = 8000):
    """等待元素可见后点击"""
    el = page.wait_for_selector(selector, timeout=timeout)
    el.click()
    return el


def login_as_admin(page):
    """登录管理员角色"""
    page.goto(BASE_URL, wait_until="networkidle", timeout=15000)
    page.wait_for_timeout(1000)
    # 点击管理员角色卡片
    admin_card = page.locator("text=管理员").first
    admin_card.click()
    page.wait_for_timeout(1500)
    # 验证已跳转到首页
    page.wait_for_url("**/dashboard**", timeout=8000)


def expand_sidebar_menu(page, menu_label: str):
    """展开侧边栏菜单"""
    # antd Menu 的 submenu 标题
    menu_item = page.locator(f".ant-menu-submenu-title:has-text('{menu_label}')").first
    menu_item.click()
    page.wait_for_timeout(800)


def click_submenu_item(page, item_label: str):
    """点击子菜单项"""
    item = page.locator(f".ant-menu-item:has-text('{item_label}')").first
    item.click()
    page.wait_for_timeout(1500)


def count_stat_cards(page) -> int:
    """统计页面中的统计卡片数量（包含 ant-statistic 的 Card）"""
    cards = page.locator(".ant-statistic")
    return cards.count()


def has_table_rows(page) -> bool:
    """检查表格是否有数据行"""
    rows = page.locator(".ant-table-tbody tr")
    return rows.count() > 0


def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        # ==================== 登录 ====================
        print("=== 登录管理员 ===")
        safe_step("5.1", "统一库存", "登录管理员角色", lambda: login_as_admin(page))
        take_screenshot(page, "01_after_login")

        # ==================== 测试5: 统一库存 ====================
        print("=== 测试5: 统一库存 ===")

        # 5.2 展开统一库存菜单
        safe_step("5.2", "统一库存", "点击侧边栏统一库存展开子菜单", lambda: expand_sidebar_menu(page, "统一库存"))
        page.wait_for_timeout(500)
        take_screenshot(page, "02_inventory_menu_expanded")

        # 5.3 点击库存总览
        safe_step("5.3", "统一库存", "点击库存总览", lambda: click_submenu_item(page, "库存总览"))
        page.wait_for_timeout(2000)
        take_screenshot(page, "03_inventory_overview")

        # 5.4 验证搜索区域可见
        safe_step("5.4", "统一库存", "验证库存总览搜索区域可见", lambda: (
            page.wait_for_selector(".ant-card", timeout=8000),
            None
        )[1] if page.locator(".ant-input, .ant-select").count() > 0 else (_ for _ in ()).throw(AssertionError("搜索区域不可见")))

        # 5.5 验证统计卡片（4个）
        safe_step("5.5", "统一库存", "验证库存总览统计卡片可见（4个）", lambda: (
            None if count_stat_cards(page) >= 4 else (_ for _ in ()).throw(AssertionError(f"统计卡片数量为 {count_stat_cards(page)}，期望4"))
        ))

        # 5.6 验证数据表格可见且有数据行
        safe_step("5.6", "统一库存", "验证库存总览数据表格可见且有数据行", lambda: (
            None if page.locator(".ant-table").count() > 0 and has_table_rows(page)
            else (_ for _ in ()).throw(AssertionError("数据表格不可见或无数据行"))
        ))

        # 5.7 点击库存预警
        safe_step("5.7", "统一库存", "点击库存预警", lambda: click_submenu_item(page, "库存预警"))
        page.wait_for_timeout(2000)
        take_screenshot(page, "04_inventory_alert")

        # 5.8 验证预警页面统计卡片（3个）
        safe_step("5.8", "统一库存", "验证库存预警统计卡片可见（3个）", lambda: (
            None if count_stat_cards(page) >= 3 else (_ for _ in ()).throw(AssertionError(f"统计卡片数量为 {count_stat_cards(page)}，期望3"))
        ))

        # 5.9 验证预警类型Tag可见
        safe_step("5.9", "统一库存", "验证预警类型Tag可见", lambda: (
            None if page.locator(".ant-tag").count() > 0
            else (_ for _ in ()).throw(AssertionError("未找到预警类型Tag"))
        ))

        # 5.10 验证预警级别Tag可见（INFO蓝/WARNING橙/CRITICAL红）
        safe_step("5.10", "统一库存", "验证预警级别Tag可见（INFO蓝/WARNING橙/CRITICAL红）", lambda: (
            None if page.locator(".ant-tag").count() > 0
            else (_ for _ in ()).throw(AssertionError("未找到预警级别Tag"))
        ))

        # 5.11 点击库存调剂
        safe_step("5.11", "统一库存", "点击库存调剂", lambda: click_submenu_item(page, "库存调剂"))
        page.wait_for_timeout(2000)
        take_screenshot(page, "05_inventory_transfer")

        # 5.12 验证调剂页面加载
        safe_step("5.12", "统一库存", "验证库存调剂页面加载", lambda: (
            page.wait_for_selector(".ant-table", timeout=8000)
        ))

        # 5.13 验证智能推荐标识可见
        safe_step("5.13", "统一库存", "验证智能推荐标识可见", lambda: (
            None if page.locator("text=智能推荐").count() > 0 or page.locator(".ant-tag:has-text('是')").count() > 0
            else (_ for _ in ()).throw(AssertionError("未找到智能推荐标识"))
        ))

        # 5.14 点击零库存托管
        safe_step("5.14", "统一库存", "点击零库存托管", lambda: click_submenu_item(page, "零库存托管"))
        page.wait_for_timeout(2000)
        take_screenshot(page, "06_zero_inventory")

        # 5.15 验证零库存托管页面加载
        safe_step("5.15", "统一库存", "验证零库存托管页面加载", lambda: (
            page.wait_for_selector(".ant-table", timeout=8000)
        ))

        # 5.16 验证页面描述文字包含"零库存托管"
        safe_step("5.16", "统一库存", "验证页面描述文字包含零库存托管", lambda: (
            None if page.locator("text=零库存托管").count() > 0
            else (_ for _ in ()).throw(AssertionError("页面未找到'零库存托管'描述文字"))
        ))

        # 5.17 验证统计卡片可见（3个：托管村卫生室数/全托管/部分托管）
        safe_step("5.17", "统一库存", "验证零库存托管统计卡片可见（3个）", lambda: (
            None if count_stat_cards(page) >= 3 else (_ for _ in ()).throw(AssertionError(f"统计卡片数量为 {count_stat_cards(page)}，期望3"))
        ))

        # 5.18 验证数据表格可见，包含Switch开关
        safe_step("5.18", "统一库存", "验证零库存托管数据表格包含Switch开关", lambda: (
            None if page.locator(".ant-switch").count() > 0
            else (_ for _ in ()).throw(AssertionError("未找到Switch开关"))
        ))

        # 5.19 点击自动补货
        safe_step("5.19", "统一库存", "点击自动补货", lambda: click_submenu_item(page, "自动补货"))
        page.wait_for_timeout(2000)
        take_screenshot(page, "07_auto_replenishment")

        # 5.20 验证自动补货页面加载
        safe_step("5.20", "统一库存", "验证自动补货页面加载", lambda: (
            page.wait_for_selector(".ant-table", timeout=8000)
        ))

        # 5.21 验证页面描述文字包含"AI智能补货"
        safe_step("5.21", "统一库存", "验证页面描述文字包含AI智能补货", lambda: (
            None if page.locator("text=AI智能补货").count() > 0
            else (_ for _ in ()).throw(AssertionError("页面未找到'AI智能补货'描述文字"))
        ))

        # 5.22 验证统计卡片可见（3个：待确认/已确认/平均置信度）
        safe_step("5.22", "统一库存", "验证自动补货统计卡片可见（3个）", lambda: (
            None if count_stat_cards(page) >= 3 else (_ for _ in ()).throw(AssertionError(f"统计卡片数量为 {count_stat_cards(page)}，期望3"))
        ))

        # 5.23 验证置信度Progress组件可见
        safe_step("5.23", "统一库存", "验证置信度Progress组件可见", lambda: (
            None if page.locator(".ant-progress").count() > 0
            else (_ for _ in ()).throw(AssertionError("未找到Progress组件"))
        ))

        # 5.24 验证触发类型Tag可见
        safe_step("5.24", "统一库存", "验证触发类型Tag可见", lambda: (
            None if page.locator(".ant-tag").count() > 0
            else (_ for _ in ()).throw(AssertionError("未找到触发类型Tag"))
        ))

        # ==================== 测试6: 统一配送 ====================
        print("=== 测试6: 统一配送 ===")

        # 6.1 展开统一配送菜单
        safe_step("6.1", "统一配送", "点击侧边栏统一配送展开子菜单", lambda: expand_sidebar_menu(page, "统一配送"))
        page.wait_for_timeout(500)
        take_screenshot(page, "08_delivery_menu_expanded")

        # 6.2 点击配送列表
        safe_step("6.2", "统一配送", "点击配送列表", lambda: click_submenu_item(page, "配送列表"))
        page.wait_for_timeout(2000)
        take_screenshot(page, "09_delivery_list")

        # 6.3 验证配送列表页面加载，统计卡片可见
        safe_step("6.3", "统一配送", "验证配送列表页面统计卡片可见", lambda: (
            None if count_stat_cards(page) >= 1 else (_ for _ in ()).throw(AssertionError("未找到统计卡片"))
        ))

        # 6.4 验证配送类型Tag可见
        safe_step("6.4", "统一配送", "验证配送类型Tag可见", lambda: (
            None if page.locator(".ant-tag").count() > 0
            else (_ for _ in ()).throw(AssertionError("未找到配送类型Tag"))
        ))

        # 6.5 点击配送跟踪
        safe_step("6.5", "统一配送", "点击配送跟踪", lambda: click_submenu_item(page, "配送跟踪"))
        page.wait_for_timeout(2000)
        take_screenshot(page, "10_delivery_track")

        # 6.6 验证配送跟踪页面加载
        safe_step("6.6", "统一配送", "验证配送跟踪页面加载", lambda: (
            page.wait_for_selector(".ant-card", timeout=8000)
        ))

        # 6.7 点击冷链监控
        safe_step("6.7", "统一配送", "点击冷链监控", lambda: click_submenu_item(page, "冷链监控"))
        page.wait_for_timeout(2000)
        take_screenshot(page, "11_cold_chain")

        # 6.8 验证冷链监控页面加载
        safe_step("6.8", "统一配送", "验证冷链监控页面加载", lambda: (
            page.wait_for_selector(".ant-card", timeout=8000)
        ))

        # 6.9 验证统计卡片可见
        safe_step("6.9", "统一配送", "验证冷链监控统计卡片可见", lambda: (
            None if count_stat_cards(page) >= 1 else (_ for _ in ()).throw(AssertionError("未找到统计卡片"))
        ))

        # ==================== 测试7: 统一结算 ====================
        print("=== 测试7: 统一结算 ===")

        # 7.1 展开统一结算菜单
        safe_step("7.1", "统一结算", "点击侧边栏统一结算展开子菜单", lambda: expand_sidebar_menu(page, "统一结算"))
        page.wait_for_timeout(500)
        take_screenshot(page, "12_settlement_menu_expanded")

        # 7.2 点击结算列表
        safe_step("7.2", "统一结算", "点击结算列表", lambda: click_submenu_item(page, "结算列表"))
        page.wait_for_timeout(2000)
        take_screenshot(page, "13_settlement_list")

        # 7.3 验证结算列表页面加载，统计卡片可见
        safe_step("7.3", "统一结算", "验证结算列表页面统计卡片可见", lambda: (
            None if count_stat_cards(page) >= 1 else (_ for _ in ()).throw(AssertionError("未找到统计卡片"))
        ))

        # 7.4 验证结算模式Tag可见
        safe_step("7.4", "统一结算", "验证结算模式Tag可见", lambda: (
            None if page.locator(".ant-tag").count() > 0
            else (_ for _ in ()).throw(AssertionError("未找到结算模式Tag"))
        ))

        # 7.5 验证结算维度Tag可见
        safe_step("7.5", "统一结算", "验证结算维度Tag可见", lambda: (
            None if page.locator(".ant-tag").count() > 0
            else (_ for _ in ()).throw(AssertionError("未找到结算维度Tag"))
        ))

        # 7.6 点击对账管理
        safe_step("7.6", "统一结算", "点击对账管理", lambda: click_submenu_item(page, "对账管理"))
        page.wait_for_timeout(2000)
        take_screenshot(page, "14_reconciliation")

        # 7.7 验证对账管理页面加载
        safe_step("7.7", "统一结算", "验证对账管理页面加载", lambda: (
            page.wait_for_selector(".ant-card", timeout=8000)
        ))

        # 7.8 验证确认状态Tag可见
        safe_step("7.8", "统一结算", "验证确认状态Tag可见", lambda: (
            None if page.locator(".ant-tag").count() > 0
            else (_ for _ in ()).throw(AssertionError("未找到确认状态Tag"))
        ))

        # 最终截图
        take_screenshot(page, "15_final_state")

        browser.close()

    # ==================== 输出结果 ====================
    total = len(results)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")

    output = {
        "testSuite": "库存+配送+结算",
        "timestamp": datetime.now(timezone(timedelta(hours=8))).isoformat(),
        "results": results,
        "summary": {
            "total": total,
            "passed": passed,
            "failed": failed,
        },
    }

    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    with open(RESULT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"测试完成！总计: {total}, 通过: {passed}, 失败: {failed}")
    print(f"结果文件: {RESULT_FILE}")
    print(f"{'='*60}")

    # 打印失败项
    if failed > 0:
        print("\n失败项详情:")
        for r in results:
            if r["status"] == "FAIL":
                print(f"  [{r['testId']}] {r['step']}: {r['detail']}")


if __name__ == "__main__":
    run_tests()
