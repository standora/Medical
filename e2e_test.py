"""
医共体智慧药房协同平台 E2E 功能测试
使用 Playwright (sync) 测试登录、Dashboard、用药目录、统一采购模块
注意：zustand store不持久化，全页刷新会丢失登录状态，需使用SPA内部导航
"""

import json
import os
import traceback
from datetime import datetime, timezone, timedelta
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
RESULTS_DIR = r"d:\Demo\medical\test-results"
RESULT_FILE = os.path.join(RESULTS_DIR, "result-1.json")


def screenshot(page, name):
    """截图并返回路径"""
    path = os.path.join(RESULTS_DIR, f"{name}.png")
    try:
        page.screenshot(path=path, full_page=False)
    except Exception:
        pass
    return path


def run_test(test_id, module, step, func, page, results):
    """执行单个测试步骤，捕获异常，记录结果"""
    detail = ""
    status = "PASS"
    shot = ""
    try:
        func()
        detail = "通过"
    except Exception as e:
        status = "FAIL"
        detail = str(e)[:300]
        traceback.print_exc()
    try:
        shot = screenshot(page, f"step-{test_id.replace('.', '-')}")
    except Exception:
        shot = ""
    results.append({
        "testId": test_id,
        "module": module,
        "step": step,
        "status": status,
        "detail": detail,
        "screenshot": shot if shot else "",
    })
    print(f"  [{status}] {test_id} {step}")


def switch_role(page, role_name):
    """通过下拉菜单切换角色的辅助函数"""
    user_area = page.locator(".ant-layout-header .ant-space").last
    user_area.click()
    page.wait_for_timeout(800)

    switch_role_submenu = page.locator(
        ".ant-dropdown-menu-submenu-title:has-text('切换角色')"
    )
    switch_role_submenu.first.hover()
    page.wait_for_timeout(600)

    role_item = page.locator(
        f".ant-dropdown-menu-submenu .ant-dropdown-menu-item:has-text('{role_name}')"
    )
    role_item.first.click(force=True, timeout=5000)
    page.wait_for_timeout(800)


def click_sidebar_menu(page, menu_text):
    """点击侧边栏菜单项（支持子菜单展开）"""
    # 先检查是否是子菜单下的项
    menu_item = page.locator(f".ant-menu-item:has-text('{menu_text}')")
    if menu_item.count() > 0:
        menu_item.first.click()
        page.wait_for_timeout(500)
        return True
    return False


def expand_sidebar_submenu(page, submenu_text):
    """展开侧边栏子菜单"""
    submenu = page.locator(f".ant-menu-submenu-title:has-text('{submenu_text}')")
    if submenu.count() > 0:
        submenu.first.click(force=True)
        page.wait_for_timeout(500)
        return True
    return False


def main():
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        # ============================================================
        # 测试1: 登录与角色切换
        # ============================================================
        module1 = "登录与角色切换"

        # 1.1 打开登录页
        def t1_1():
            page.goto(f"{BASE_URL}/login", timeout=15000)
            page.wait_for_load_state("networkidle", timeout=10000)
            assert "/login" in page.url, f"未跳转到登录页, 当前URL: {page.url}"
        run_test("1.1", module1, "打开登录页", t1_1, page, results)

        # 1.2 验证登录页显示3个角色卡片
        def t1_2():
            cards = page.locator(".login-role-card")
            count = cards.count()
            assert count == 3, f"角色卡片数量不等于3, 实际: {count}"
        run_test("1.2", module1, "验证登录页显示3个角色卡片", t1_2, page, results)

        # 1.3 点击"管理员"角色登录
        def t1_3():
            cards = page.locator(".login-role-card")
            admin_card = cards.filter(has_text="管理员")
            assert admin_card.count() > 0, "未找到管理员角色卡片"
            admin_card.first.click()
            page.wait_for_load_state("networkidle", timeout=10000)
        run_test("1.3", module1, "点击管理员角色登录", t1_3, page, results)

        # 1.4 验证跳转到Dashboard首页
        def t1_4():
            page.wait_for_url("**/dashboard**", timeout=10000)
            assert "/dashboard" in page.url, f"未跳转到Dashboard, 当前URL: {page.url}"
        run_test("1.4", module1, "验证跳转到Dashboard首页", t1_4, page, results)

        # 1.5 验证侧边栏菜单可见
        def t1_5():
            sidebar = page.locator(".ant-layout-sider")
            assert sidebar.is_visible(), "侧边栏不可见"
        run_test("1.5", module1, "验证侧边栏菜单可见", t1_5, page, results)

        # 1.6 验证顶栏显示用户信息
        def t1_6():
            header = page.locator(".ant-layout-header")
            assert header.is_visible(), "顶栏不可见"
            user_text = page.locator(".ant-layout-header :text('系统管理员')")
            assert user_text.is_visible(), "顶栏未显示用户信息(系统管理员)"
        run_test("1.6", module1, "验证顶栏显示用户信息", t1_6, page, results)

        # 1.7 点击用户下拉菜单中的角色切换
        def t1_7():
            user_area = page.locator(".ant-layout-header .ant-space").last
            user_area.click()
            page.wait_for_timeout(800)
            switch_role_submenu = page.locator(
                ".ant-dropdown-menu-submenu-title:has-text('切换角色')"
            )
            assert switch_role_submenu.count() > 0, "未找到切换角色菜单项"
            switch_role_submenu.first.hover()
            page.wait_for_timeout(600)
            submenu_items = page.locator(
                ".ant-dropdown-menu-submenu .ant-dropdown-menu-item"
            )
            assert submenu_items.count() >= 3, f"角色子菜单项不足3个, 实际: {submenu_items.count()}"
        run_test("1.7", module1, "点击用户下拉菜单中的角色切换", t1_7, page, results)

        # 1.8 切换到"药师"角色
        def t1_8():
            pharmacist_item = page.locator(
                ".ant-dropdown-menu-submenu .ant-dropdown-menu-item:has-text('药师')"
            )
            assert pharmacist_item.count() > 0, "未找到药师角色选项"
            pharmacist_item.first.click(force=True, timeout=5000)
            page.wait_for_timeout(800)
            user_text = page.locator(":text('张药师')")
            assert user_text.is_visible(), "角色切换后未显示张药师"
        run_test("1.8", module1, "切换到药师角色", t1_8, page, results)

        # 1.9 切换回"管理员"角色
        def t1_9():
            switch_role(page, "管理员")
            user_text = page.locator(":text('系统管理员')")
            assert user_text.is_visible(), "角色切换后未显示系统管理员"
        run_test("1.9", module1, "切换回管理员角色", t1_9, page, results)

        # ============================================================
        # 测试2: Dashboard首页（使用SPA内部导航，不刷新页面）
        # ============================================================
        module2 = "Dashboard首页"

        # 2.1 验证6个统计卡片可见
        def t2_1():
            # 使用侧边栏导航到首页，而非page.goto()
            click_sidebar_menu(page, "首页总览")
            page.wait_for_timeout(500)
            stat_cards = page.locator(".stat-card")
            count = stat_cards.count()
            assert count == 6, f"统计卡片数量不等于6, 实际: {count}"
        run_test("2.1", module2, "验证6个统计卡片可见", t2_1, page, results)

        # 2.2 验证快捷入口区域可见（8个模块入口）
        def t2_2():
            quick_entries = page.locator(".ant-card-hoverable")
            count = quick_entries.count()
            assert count >= 8, f"快捷入口数量不足8个, 实际: {count}"
        run_test("2.2", module2, "验证快捷入口区域可见", t2_2, page, results)

        # 2.3 点击"用药目录"快捷入口
        def t2_3():
            entry = page.locator(".ant-card-hoverable").filter(has_text="用药目录")
            assert entry.count() > 0, "未找到用药目录快捷入口"
            entry.first.click()
            page.wait_for_timeout(1000)
        run_test("2.3", module2, "点击用药目录快捷入口", t2_3, page, results)

        # 2.4 验证跳转到用药目录页面
        def t2_4():
            assert "/catalog" in page.url, f"未跳转到用药目录, 当前URL: {page.url}"
        run_test("2.4", module2, "验证跳转到用药目录页面", t2_4, page, results)

        # 2.5 返回Dashboard
        def t2_5():
            click_sidebar_menu(page, "首页总览")
            page.wait_for_timeout(500)
            assert "/dashboard" in page.url, f"未返回Dashboard, 当前URL: {page.url}"
        run_test("2.5", module2, "返回Dashboard", t2_5, page, results)

        # ============================================================
        # 测试3: 统一用药目录
        # ============================================================
        module3 = "统一用药目录"

        # 3.1 从侧边栏点击"统一用药目录"
        def t3_1():
            menu_item = page.locator(".ant-menu-item:has-text('统一用药目录')")
            assert menu_item.count() > 0, "侧边栏未找到统一用药目录菜单"
            menu_item.first.click()
            page.wait_for_timeout(1000)
            assert "/catalog" in page.url, f"未跳转到用药目录, 当前URL: {page.url}"
        run_test("3.1", module3, "从侧边栏点击统一用药目录", t3_1, page, results)

        # 3.2 验证搜索区域可见
        def t3_2():
            search_form = page.locator(".ant-form")
            assert search_form.is_visible(), "搜索区域不可见"
        run_test("3.2", module3, "验证搜索区域可见", t3_2, page, results)

        # 3.3 验证数据表格可见且有数据行
        def t3_3():
            table = page.locator(".ant-table")
            assert table.is_visible(), "数据表格不可见"
            rows = page.locator(".ant-table-tbody .ant-table-row")
            count = rows.count()
            assert count > 0, f"数据表格无数据行, 行数: {count}"
        run_test("3.3", module3, "验证数据表格可见且有数据行", t3_3, page, results)

        # 3.4 验证目录类型Tag可见
        def t3_4():
            tags = page.locator(".ant-table-tbody .ant-tag")
            assert tags.count() > 0, "未找到目录类型Tag"
        run_test("3.4", module3, "验证目录类型Tag可见", t3_4, page, results)

        # 3.5 验证状态Tag可见
        def t3_5():
            status_tags = page.locator(".ant-table-tbody .ant-tag")
            assert status_tags.count() > 0, "未找到状态Tag"
        run_test("3.5", module3, "验证状态Tag可见", t3_5, page, results)

        # 3.6 点击某行的"详情"按钮
        def t3_6():
            detail_btn = page.locator(".ant-table-tbody .ant-btn:has-text('详情')")
            assert detail_btn.count() > 0, "未找到详情按钮"
            detail_btn.first.click()
            page.wait_for_timeout(1000)
        run_test("3.6", module3, "点击某行的详情按钮", t3_6, page, results)

        # 3.7 验证Drawer打开，显示药品详情信息
        def t3_7():
            drawer = page.locator(".ant-drawer")
            assert drawer.is_visible(), "Drawer未打开"
            detail_title = page.locator(".ant-drawer-header :text('药品详情')")
            assert detail_title.is_visible(), "Drawer中未显示药品详情标题"
            descriptions = page.locator(".ant-drawer .ant-descriptions")
            assert descriptions.is_visible(), "Drawer中未显示药品详情描述信息"
        run_test("3.7", module3, "验证Drawer打开显示药品详情信息", t3_7, page, results)

        # 3.8 关闭Drawer
        def t3_8():
            close_btn = page.locator(".ant-drawer-close")
            if close_btn.count() > 0:
                close_btn.first.click(force=True)
            else:
                # 备选：按Escape关闭
                page.keyboard.press("Escape")
            page.wait_for_timeout(1000)
            # 检查Drawer是否关闭（antd动画需要时间）
            drawer = page.locator(".ant-drawer-open")
            if drawer.count() > 0:
                page.keyboard.press("Escape")
                page.wait_for_timeout(500)
        run_test("3.8", module3, "关闭Drawer", t3_8, page, results)

        # 3.9 点击"新增药品"按钮
        def t3_9():
            add_btn = page.locator("button:has-text('新增药品')")
            assert add_btn.is_visible(), "未找到新增药品按钮"
            add_btn.click()
            page.wait_for_timeout(1000)
        run_test("3.9", module3, "点击新增药品按钮", t3_9, page, results)

        # 3.10 验证Modal打开，表单可见
        def t3_10():
            modal = page.locator(".ant-modal")
            assert modal.is_visible(), "Modal未打开"
            form = modal.locator(".ant-form")
            assert form.is_visible(), "Modal中表单不可见"
        run_test("3.10", module3, "验证Modal打开表单可见", t3_10, page, results)

        # 3.11 关闭Modal
        def t3_11():
            cancel_btn = page.locator(".ant-modal button:has-text('取消')")
            if cancel_btn.count() > 0:
                cancel_btn.first.click(force=True)
            else:
                page.keyboard.press("Escape")
            page.wait_for_timeout(1000)
            # 确保Modal完全关闭
            modal_wrap = page.locator(".ant-modal-wrap")
            if modal_wrap.count() > 0:
                page.keyboard.press("Escape")
                page.wait_for_timeout(500)
        run_test("3.11", module3, "关闭Modal", t3_11, page, results)

        # ============================================================
        # 测试4: 统一采购
        # ============================================================
        module4 = "统一采购"

        # 4.1 点击侧边栏"统一采购"展开子菜单
        def t4_1():
            submenu = page.locator(".ant-menu-submenu-title:has-text('统一采购')")
            assert submenu.count() > 0, "侧边栏未找到统一采购菜单"
            submenu.first.click(force=True)
            page.wait_for_timeout(500)
        run_test("4.1", module4, "点击侧边栏统一采购展开子菜单", t4_1, page, results)

        # 4.2 点击"采购计划"
        def t4_2():
            menu_item = page.locator(".ant-menu-item:has-text('采购计划')")
            assert menu_item.count() > 0, "未找到采购计划菜单项"
            menu_item.first.click()
            page.wait_for_timeout(1000)
            assert "/purchase/plan" in page.url, f"未跳转到采购计划, 当前URL: {page.url}"
        run_test("4.2", module4, "点击采购计划", t4_2, page, results)

        # 4.3 验证采购计划页面加载，数据表格可见
        def t4_3():
            table = page.locator(".ant-table")
            assert table.is_visible(), "采购计划数据表格不可见"
            rows = page.locator(".ant-table-tbody .ant-table-row")
            assert rows.count() > 0, "采购计划数据表格无数据行"
        run_test("4.3", module4, "验证采购计划页面加载数据表格可见", t4_3, page, results)

        # 4.4 展开某行查看采购明细
        def t4_4():
            # 采购计划页面使用"查看详情"按钮来展开/折叠行
            expand_btn = page.locator(".ant-table-tbody .ant-btn:has-text('查看详情')")
            if expand_btn.count() > 0:
                expand_btn.first.click()
                page.wait_for_timeout(800)
                expanded_row = page.locator(".ant-table-expanded-row")
                assert expanded_row.count() > 0, "展开行未出现"
            else:
                # 备选：尝试点击展开图标
                expand_icon = page.locator(".ant-table-row-expand-icon")
                if expand_icon.count() > 0:
                    expand_icon.first.click()
                    page.wait_for_timeout(800)
                else:
                    raise Exception("未找到展开行的方式")
        run_test("4.4", module4, "展开某行查看采购明细", t4_4, page, results)

        # 4.5 点击"采购订单"
        def t4_5():
            # 展开统一采购子菜单
            expand_sidebar_submenu(page, "统一采购")
            page.wait_for_timeout(500)
            menu_item = page.locator(".ant-menu-item:has-text('采购订单')")
            if menu_item.count() > 0 and menu_item.first.is_visible():
                menu_item.first.click()
            else:
                # 如果菜单项不可见，通过JS点击触发React事件
                page.evaluate("""() => {
                    const item = document.querySelector('[data-menu-id="rc-menu-uuid-/purchase/order"]');
                    if (item) item.click();
                }""")
            page.wait_for_timeout(1000)
            assert "/purchase/order" in page.url, f"未跳转到采购订单, 当前URL: {page.url}"
        run_test("4.5", module4, "点击采购订单", t4_5, page, results)

        # 4.6 验证采购订单页面加载，统计卡片可见
        def t4_6():
            stat_cards = page.locator(".ant-statistic")
            count = stat_cards.count()
            assert count >= 4, f"采购订单统计卡片数量不足4个, 实际: {count}"
        run_test("4.6", module4, "验证采购订单页面加载统计卡片可见", t4_6, page, results)

        # 4.7 验证数据表格可见
        def t4_7():
            table = page.locator(".ant-table").first
            assert table.is_visible(), "采购订单数据表格不可见"
            rows = page.locator(".ant-table-tbody .ant-table-row").first
            assert rows.is_visible(), "采购订单数据表格无数据行"
        run_test("4.7", module4, "验证采购订单数据表格可见", t4_7, page, results)

        # 4.8 点击"集采统计"
        def t4_8():
            expand_sidebar_submenu(page, "统一采购")
            menu_item = page.locator(".ant-menu-item:has-text('集采统计')")
            assert menu_item.count() > 0, "未找到集采统计菜单项"
            menu_item.first.click()
            page.wait_for_timeout(1000)
            assert "/purchase/centralized" in page.url, f"未跳转到集采统计, 当前URL: {page.url}"
        run_test("4.8", module4, "点击集采统计", t4_8, page, results)

        # 4.9 验证集采统计页面加载，统计卡片可见
        def t4_9():
            stat_cards = page.locator(".ant-statistic")
            count = stat_cards.count()
            assert count >= 3, f"集采统计卡片数量不足3个, 实际: {count}"
        run_test("4.9", module4, "验证集采统计页面加载统计卡片可见", t4_9, page, results)

        # 4.10 验证执行率Progress组件可见
        def t4_10():
            progress = page.locator(".ant-progress")
            count = progress.count()
            assert count > 0, f"未找到执行率Progress组件, 数量: {count}"
        run_test("4.10", module4, "验证执行率Progress组件可见", t4_10, page, results)

        # 最终截图
        screenshot(page, "final-state")

        browser.close()

    # ============================================================
    # 汇总结果
    # ============================================================
    total = len(results)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")

    tz = timezone(timedelta(hours=8))
    output = {
        "testSuite": "登录+首页+目录+采购",
        "timestamp": datetime.now(tz).isoformat(),
        "results": results,
        "summary": {
            "total": total,
            "passed": passed,
            "failed": failed,
        },
    }

    with open(RESULT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"测试完成! 总计: {total}, 通过: {passed}, 失败: {failed}")
    print(f"结果已保存到: {RESULT_FILE}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
