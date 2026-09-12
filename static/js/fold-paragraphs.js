/**
 * 自动折叠 H2#自由补充 下面超过3行的 Axx: 开头的 p 标签
 * FIXME: 遇見li中多p（也就是含\n\n），會dom佈局偏移
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

  // 遍历回答分组并处理折叠
  groups.forEach((ps) => {
    // 1. 单段回答处理
    if (ps.length === 1) {
      const p = ps[0];
      p.classList.add("foldable-p", "is-clamped");

      // 超过 3 行才保留按钮，否则移除 is-clamped
      if (p.scrollHeight > p.clientHeight) {
        const btn = makeBtn(() => {
          const isClamped = p.classList.toggle("is-clamped");
          btn.textContent = isClamped ? "展开全文 ↓" : "收起全文 ↑";
        });
        p.after(btn);
      } else {
        p.classList.remove("is-clamped");
      }
      return;
    }

    // 2. 多段回答处理
    const li = ps[0].parentElement;
    if (!li) return;

    // 创建包裹容器，默认先加上 is-clamped 截断
    const wrap = document.createElement("div");
    wrap.className = "fold-wrap is-clamped";
    ps.forEach((p) => wrap.appendChild(p));
    li.prepend(wrap);

    // 利用原生渲染高度判断是否超长
    if (wrap.scrollHeight > wrap.clientHeight) {
      const btn = makeBtn(() => {
        const isClamped = wrap.classList.toggle("is-clamped");
        btn.textContent = isClamped ? "展开全文 ↓" : "收起全文 ↑";
      });
      li.append(btn);
    } else {
      wrap.classList.remove("is-clamped");
    }
  });
}
