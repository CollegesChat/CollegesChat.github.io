/**
 * 自动折叠 H2#自由补充 下面超过3行的 Axx: 开头的 p 标签
 */
export function initParagraphFolder() {
    // 找到所有以 "自由补充" 开头的标题（含 v1/v2 两个 tab 的 ## 自由补充-v1 / 自由补充-v2）
    const headings = document.querySelectorAll('[id^="自由补充"]');
    if (!headings.length) return;

    // 标题之后是单个 <ul>，里面的回答在 <li> 中（一个 <li> 可能含多个 <p>，视为同一个回答）
    const groups = [];
    headings.forEach((heading) => {
        let nextEl = heading.nextElementSibling;
        while (nextEl && nextEl.tagName !== "H2") {
            if (nextEl.tagName === "UL") {
                nextEl.querySelectorAll(":scope > li").forEach((li) => {
                    // 跳过已被 <details> 折叠的重复回答分组，只处理直接回答的 p
                    if (li.querySelector("details")) return;
                    const ps = Array.from(li.querySelectorAll(":scope > p"));
                    if (ps.length && /^A\d+[:：]/.test(ps[0].textContent.trim())) {
                        groups.push(ps);
                    }
                });
            }
            nextEl = nextEl.nextElementSibling;
        }
    });

    const makeBtn = (onToggle) => {
        const btn = document.createElement("span");
        btn.className = "fold-toggle-btn";
        btn.textContent = "展开全文 ↓";
        btn.addEventListener("click", onToggle);
        return btn;
    };

    // 遍历这些 p 组，判断并执行折叠
    groups.forEach((ps) => {
        // 先加上基础样式类
        ps.forEach((p) => p.classList.add("foldable-p"));

        // 单段回答：沿用按 <p> 自身的 -webkit-line-clamp 截断
        if (ps.length === 1) {
            const p = ps[0];
            const fullHeight = p.scrollHeight; // 未折叠时的真实高度
            p.classList.add("is-clamped");
            const clampedHeight = p.clientHeight; // 限制3行后的高度
            if (fullHeight > clampedHeight) {
                // 创建“展开全文”按钮，插在该 p 标签的后面
                const btn = makeBtn(() => {
                    const isClamped = p.classList.contains("is-clamped");
                    isClamped ? p.classList.remove("is-clamped") : p.classList.add("is-clamped");
                    btn.textContent = isClamped ? "收起全文 ↑" : "展开全文 ↓";
                });
                p.after(btn);
            } else {
                // 如果没超过3行，移除 line-clamp 限制，保持原样展示
                p.classList.remove("is-clamped");
            }
            return;
        }

        // 多段回答：单段都 ≤3 行时按 <p> 截断不会触发，改为把 <p> 包进容器，按 3 行 max-height 整体截断。
        // 注意：不能在 <li> 上应用 overflow:hidden，否则会吃掉列表的 ::marker 圆点。
        const li = ps[0].parentElement;
        if (!li) return;
        const lineH = parseFloat(getComputedStyle(ps[0]).lineHeight) || 25.6; // 3 行的高度
        const cap = lineH * 3;
        const fullHeight = ps.reduce((sum, p) => sum + (p.scrollHeight || 0), 0);
        if (fullHeight <= cap) return;

        const wrap = document.createElement("div");
        wrap.className = "fold-wrap";
        wrap.style.cssText = `max-height:${cap}px;overflow:hidden;`;
        ps.forEach((p) => wrap.appendChild(p));
        li.prepend(wrap);

        const btn = makeBtn(() => {
            const clamped = wrap.style.maxHeight !== "";
            wrap.style.maxHeight = clamped ? "" : cap + "px";
            wrap.style.overflow = clamped ? "" : "hidden";
            btn.textContent = clamped ? "收起全文 ↑" : "展开全文 ↓";
        });
        li.append(btn);
    });
}