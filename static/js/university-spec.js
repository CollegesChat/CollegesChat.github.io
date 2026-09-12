import { initParagraphFolder } from "./fold-paragraphs.js";
function onDomReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  } else {
    callback();
  }
}

onDomReady(() => {
  const isTouchDevice = window.matchMedia("(hover: none)").matches;
  //  解析页面中的 ID 信息映射。
  //  旧格式：A106 (2021年06月)
  //  新格式：A306 (2026年09月): 2026-06, 测试, （不愿透露）, 大专, 北京-北京市-东城区, 主校区
  const infoMap = Object.fromEntries(
    [...document.querySelectorAll("blockquote + details li")]
      .map((li) => {
        const text = li.textContent.trim();
        const match = text.match(/^(A\d+)\s*\((.*?)\)(?:\s*:\s*(.*))?$/);
        if (!match) return null;
        const [, id, time, meta] = match;
        return [id, { time, meta }];
      })
      .filter(Boolean),
  );

  const escapeHtml = (str) =>
    str.replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&",
          "<": "<",
          ">": ">",
          '"': '"',
          "'": "'",
        })[ch],
    );

  // 新格式字段顺序固定：Q3(入学年份, 专业, 性别), Q4(学历), Q5(地区, 校区)
  const META_LABELS = ["入学年份", "专业", "性别", "学历", "地区", "校区"];

  const buildMetaLines = (meta) => {
    if (!meta || !meta.trim()) return "";
    const parts = meta
      .split(/,\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return "";
    return parts
      .map((val, i) => (META_LABELS[i] ? `${META_LABELS[i]}: ${val}` : val))
      .join("\n");
  };

  const makeIdSpan = (id, info) => {
    const actionText = isTouchDevice ? "长按反馈问题" : "右键反馈问题";
    let title = `回答时间: ${info?.time || ""}`;
    const metaLines = buildMetaLines(info?.meta);
    if (metaLines) title += `\n${metaLines}`;
    title += ` (${actionText})`;
    return `<span class="id-link" data-id="${id}" data-title="${escapeHtml(title)}">${id}</span>`;
  };

  //  为已有 HTML 中的 ID 添加交互式 span（后端已完成重复回答折叠）
  document
    .querySelectorAll('h2:is([id^="q"], [id^="自由补充"]) + ul')
    .forEach((ul) => {
      for (const li of ul.querySelectorAll(":scope > li")) {
        const details = li.querySelector("details");
        if (details) {
          const innerItems = details.querySelectorAll("p, li");
          if (innerItems.length) {
            innerItems.forEach((el) => {
              const text = el.textContent;
              if (/^\s*A\d+[:：]/.test(text)) {
                el.innerHTML = text.replace(/^\s*(A\d+)/, (_, id) =>
                  makeIdSpan(id, infoMap[id]),
                );
              } else {
                el.innerHTML = text.replace(/A\d+/g, (id) =>
                  makeIdSpan(id, infoMap[id]),
                );
              }
            });
          } else {
            const div = details.querySelector("div");
            if (div) {
              div.innerHTML = div.textContent.replace(/A\d+/g, (id) =>
                makeIdSpan(id, infoMap[id]),
              );
            }
          }
        } else {
          const directPs = li.querySelectorAll(":scope > p");
          if (directPs.length) {
            // 保留 <p> 结构，只替换开头的 A 编号，供 fold-paragraphs 折叠
            directPs.forEach((p) => {
              p.innerHTML = p.textContent.replace(/^\s*(A\d+)/, (_, id) =>
                makeIdSpan(id, infoMap[id]),
              );
            });
          } else {
            li.innerHTML = li.textContent.replace(/^\s*(A\d+)/, (_, id) =>
              makeIdSpan(id, infoMap[id]),
            );
          }
        }
      }
    });

  //  电脑端：右键直接跳转
  document.addEventListener("contextmenu", (e) => {
    const el = e.target.closest(".id-link");
    if (!el) return;
    // 如果是触摸设备，交给下面的触摸事件处理，阻止默认右键
    if (window.matchMedia("(hover: none)").matches) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    triggerReport(el.dataset.id);
  });

  //  移动端专门处理：精准区分“轻点看日期”与“长按 800ms 跳转”
  let longPressTimer = null;
  let isLongPressAction = false;
  // 跳转公共函数
  function triggerReport(id, el) {
    const currentBaseUrl =
      window.location.origin +
      window.location.pathname +
      window.location.search;

    const myHighlightUrl = `${currentBaseUrl}#:~:text=${id}`;

    window.open(
      `https://github.com/CollegesChat/university-information/issues/new?template=malicious_data.yml&title=${encodeURIComponent(
        `[数据举报]：${id}`,
      )}&target=${encodeURIComponent(
        document.querySelector('meta[itemprop="name"]').content,
      )}&extra=${encodeURIComponent(myHighlightUrl)}`,
      "_blank",
    );
  }

  document.addEventListener(
    "touchstart",
    (e) => {
      const el = e.target.closest(".id-link");
      if (!el) return;

      isLongPressAction = false;

      longPressTimer = setTimeout(() => {
        isLongPressAction = true;

        if (navigator.vibrate) navigator.vibrate(50);

        if (confirm(`是否要针对 ID: ${el.dataset.id} 发起数据举报？`)) {
          // 关键改动：把当前点击的元素 el 传过去用来计算前后文
          triggerReport(el.dataset.id, el);
        }
        el.classList.remove("show-tip");
      }, 800);
    },
    { passive: true },
  );
  document.addEventListener("touchend", (e) => {
    const el = e.target.closest(".id-link");

    // 只要手抬起来了，立刻清除长按定时器
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    if (!el) return;

    // 如果不是长按，说明是“轻点”
    if (!isLongPressAction) {
      // 切换日期气泡的显示与隐藏
      const hasTip = el.classList.contains("show-tip");
      // 先清空页面上所有其他的气泡
      document
        .querySelectorAll(".id-link.show-tip")
        .forEach((node) => node.classList.remove("show-tip"));
      if (!hasTip) {
        el.classList.add("show-tip");
      }
    }
  });

  // 手指在屏幕上滑动时，取消长按判定
  document.addEventListener(
    "touchmove",
    () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    },
    { passive: true },
  );

  // 点击页面其他空白处时，隐藏手机上的日期气泡
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".id-link")) {
      document
        .querySelectorAll(".id-link.show-tip")
        .forEach((node) => node.classList.remove("show-tip"));
    }
  });
  initParagraphFolder();
});
