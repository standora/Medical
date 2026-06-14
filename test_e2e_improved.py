from playwright.sync_api import sync_playwright
import json
import os
from datetime import datetime

BASE_URL = "http://localhost:5173"
RESULTS_DIR = r"d:\Demo\medical\test-results"
os.makedirs(RESULTS_DIR, exist_ok=True)

# 页面路由和名称映射
PAGES = [
    ("/dashboard", "首页总览"),
    ("/catalog", "统一用药目录"),
    ("/purchase/plan", "采购计划"),
    ("/purchase/order", "采购订单"),
    ("/purchase/centralized", "集采统计"),
    ("/inventory/overview", "库存总览"),
    ("/inventory/alert", "库存预警"),
    ("/inventory/transfer", "库存调剂"),
    ("/inventory/zero", "零库存托管"),
    ("/inventory/replenishment", "自动补货"),
    ("/delivery/list", "配送列表"),
    ("/delivery/track", "配送跟踪"),
    ("/delivery/cold-chain", "冷链监控"),
    ("/settlement/list", "结算列表"),
    ("/settlement/reconciliation", "对账管理"),
    ("/prescription/list", "处方列表"),
    ("/prescription/create", "开具处方"),
    ("/prescription/flow", "处方流转"),
    ("/quality/interaction", "合理用药"),
    ("/quality/trace", "药品追溯"),
    ("/stats", "统计分析"),
]

# 侧边栏菜单点击路径（用于SPA内部导航）
MENU_PATHS = {
    "首页总览": ["首页总览"],
    "统一用药目录": ["统一用药目录"],
    "采购计划": ["统一采购", "采购计划"],
    "采购订单": ["统一采购", "采购订单"],
    "集采统计": ["统一采购", "集采统计"],
    "库存总览": ["统一库存", "库存总览"],
    "库存预警": ["统一库存", "库存预警"],
    "库存调剂": ["统一库存", "库存调剂"],
    "零库存托管": ["统一库存", "零库存托管"],
    "自动补货": ["统一库存", "自动补货"],
    "配送列表": ["统一配送", "配送列表"],
    "配送跟踪": ["统一配送", "配送跟踪"],
    "冷链监控": ["统一配送", "冷链监控"],
    "结算列表": ["统一结算", "结算列表"],
    "对账管理": ["统一结算", "对账管理"],
    "处方列表": ["处方流转", "处方列表"],
    "开具处方": ["处方流转", "开具处方"],
    "处方流转": ["处方流转", "处方流转"],
    "合理用药": ["药事质控", "合理用药"],
    "药品追溯": ["药事质控", "药品追溯"],
    "统计分析": ["统计分析"],
}

def run_tests():
    results = []
    interaction_results = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        
        # 登录
        page.goto(BASE_URL, timeout=15000)
        page.wait_for_load_state("domcontentloaded", timeout=10000)
        page.wait_for_timeout(3000)
        
        # 点击管理员登录
        try:
            admin_card = page.locator("text=管理员").first
            admin_card.click(timeout=5000)
            page.wait_for_timeout(3000)
        except Exception as e:
            print(f"登录步骤异常: {e}")
        
        # 遍历所有页面
        for route, name in PAGES:
            js_errors = []
            
            # 设置错误监听
            page.on("pageerror", lambda err, errors=js_errors: errors.append(str(err)))
            page.on("console", lambda msg, errors=js_errors: errors.append(msg.text) if msg.type == "error" else None)
            
            # 通过侧边栏菜单导航
            menu_path = MENU_PATHS.get(name, [name])
            try:
                for menu_text in menu_path:
                    # 先尝试子菜单项
                    menu_item = page.locator(f".ant-menu-item-content:has-text('{menu_text}'), .ant-menu-title-content:has-text('{menu_text}')").first
                    try:
                        if menu_item.is_visible(timeout=1500):
                            menu_item.click(timeout=3000)
                            page.wait_for_timeout(500)
                            continue
                    except:
                        pass
                    # 尝试展开父菜单
                    submenu = page.locator(f".ant-menu-submenu-title:has-text('{menu_text}')").first
                    try:
                        if submenu.is_visible(timeout=1500):
                            submenu.click(timeout=3000)
                            page.wait_for_timeout(800)
                    except:
                        pass
            except Exception as e:
                js_errors.append(f"导航失败: {str(e)}")
            
            page.wait_for_timeout(2000)  # 等待懒加载
            
            # 检查崩溃
            has_crash = False
            try:
                crash_text = page.locator("text=Unexpected Application Error")
                has_crash = crash_text.is_visible(timeout=1000)
            except:
                pass
            
            # 检查表格数据行数
            table_rows = 0
            try:
                table_rows = page.locator(".ant-table-tbody tr").count()
            except:
                pass
            
            # 截图
            screenshot_path = os.path.join(RESULTS_DIR, f"improved-{route.replace('/', '_')}.png")
            page.screenshot(path=screenshot_path)
            
            status = "PASS" if not has_crash and len(js_errors) == 0 else "FAIL"
            results.append({
                "testId": f"P{len(results)+1:02d}",
                "page": route,
                "pageName": name,
                "jsErrors": js_errors[:5],  # 最多5条
                "hasCrash": has_crash,
                "tableRowCount": table_rows,
                "screenshot": screenshot_path,
                "status": status,
                "detail": f"崩溃={has_crash}, JS错误={len(js_errors)}, 表格行={table_rows}"
            })
            
            # 清除错误监听（通过重新创建page对象的方式不可行，所以用新列表）
            # 每个页面用新的js_errors列表
        
        # 交互操作测试
        interactions = [
            {"page": "采购计划", "action": "展开行查看明细", "steps": [
                lambda pg: pg.locator("text=查看详情").first.click() if pg.locator("text=查看详情").first.is_visible(timeout=2000) else None,
            ]},
            {"page": "统一用药目录", "action": "打开详情Drawer", "steps": [
                lambda pg: pg.locator("text=详情").first.click() if pg.locator("text=详情").first.is_visible(timeout=2000) else None,
            ]},
            {"page": "统一用药目录", "action": "打开新增Modal", "steps": [
                lambda pg: pg.locator("text=新增药品").first.click() if pg.locator("text=新增药品").first.is_visible(timeout=2000) else None,
            ]},
        ]
        
        for inter in interactions:
            inter_errors = []
            page.on("pageerror", lambda err, errors=inter_errors: errors.append(str(err)))
            
            # 先导航到对应页面
            menu_path = MENU_PATHS.get(inter["page"], [inter["page"]])
            try:
                for menu_text in menu_path:
                    submenu = page.locator(f".ant-menu-submenu-title:has-text('{menu_text}')").first
                    menu_item = page.locator(f".ant-menu-item-content:has-text('{menu_text}'), .ant-menu-title-content:has-text('{menu_text}')").first
                    try:
                        if submenu.is_visible(timeout=1500):
                            submenu.click(timeout=3000)
                            page.wait_for_timeout(800)
                        elif menu_item.is_visible(timeout=1500):
                            menu_item.click(timeout=3000)
                            page.wait_for_timeout(500)
                    except:
                        pass
                page.wait_for_timeout(2000)
                
                # 执行操作步骤
                for step in inter["steps"]:
                    step(page)
                    page.wait_for_timeout(1000)
                
                # 检查是否有新错误
                status = "PASS" if len(inter_errors) == 0 else "FAIL"
            except Exception as e:
                inter_errors.append(str(e))
                status = "FAIL"
            
            interaction_results.append({
                "testId": f"I{len(interaction_results)+1:02d}",
                "page": inter["page"],
                "action": inter["action"],
                "jsErrors": inter_errors[:3],
                "status": status
            })
            
            # 关闭可能打开的Drawer/Modal
            try:
                page.keyboard.press("Escape")
                page.wait_for_timeout(500)
            except:
                pass
        
        browser.close()
    
    # 汇总结果
    passed_pages = sum(1 for r in results if r["status"] == "PASS")
    failed_pages = sum(1 for r in results if r["status"] == "FAIL")
    passed_inter = sum(1 for r in interaction_results if r["status"] == "PASS")
    failed_inter = sum(1 for r in interaction_results if r["status"] == "FAIL")
    total_js_errors = sum(len(r["jsErrors"]) for r in results) + sum(len(r["jsErrors"]) for r in interaction_results)
    
    report = {
        "testSuite": "改进版E2E测试（含JS错误捕获）",
        "timestamp": datetime.now().isoformat(),
        "results": results,
        "interactionResults": interaction_results,
        "summary": {
            "totalPages": len(results),
            "passedPages": passed_pages,
            "failedPages": failed_pages,
            "totalInteractions": len(interaction_results),
            "passedInteractions": passed_inter,
            "failedInteractions": failed_inter,
            "totalJsErrors": total_js_errors
        }
    }
    
    output_path = os.path.join(RESULTS_DIR, "result-improved.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n测试完成！")
    print(f"页面测试: {passed_pages}/{len(results)} 通过")
    print(f"交互测试: {passed_inter}/{len(interaction_results)} 通过")
    print(f"JS错误总数: {total_js_errors}")
    print(f"结果已保存到: {output_path}")
    
    # 输出失败项
    failed = [r for r in results if r["status"] == "FAIL"]
    if failed:
        print(f"\n失败页面:")
        for r in failed:
            print(f"  - {r['pageName']}({r['page']}): {r['detail']}")
            for err in r['jsErrors']:
                print(f"    错误: {err[:100]}")

if __name__ == "__main__":
    run_tests()
