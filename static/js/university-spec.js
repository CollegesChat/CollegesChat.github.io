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
    //  解析页面中的 ID 和时间映射
    const idTimeMap = Object.fromEntries(
        [...document.querySelectorAll("blockquote + details li")]
            .map((li) => {
                const text = li.textContent.trim();
                const id = text.match(/A\d+/)?.[0];
                const time = text.match(/\((.*?)\)/)?.[1];
                return id && time ? [id, time] : null;
            })
            .filter(Boolean),
    );

    const makeIdSpan = (id, time) => {
        const actionText = isTouchDevice ? "长按反馈问题" : "右键反馈问题";
        return `<span class="id-link" data-id="${id}" data-title="回答时间: ${time} (${actionText})">${id}</span>`;
    };

    //  为已有 HTML 中的 ID 添加交互式 span（后端已完成重复回答折叠）
    document.querySelectorAll('h2[id^="q"] + ul').forEach((ul) => {
        ul.querySelectorAll("li").forEach((li) => {
            const div = li.querySelector("div");
            if (div) {
                div.innerHTML = div.textContent.replace(
                    /A\d+/g,
                    (id) => makeIdSpan(id, idTimeMap[id] || ""),
                );
            } else {
                li.innerHTML = li.textContent.replace(
                    /^(A\d+)/,
                    (_, id) => makeIdSpan(id, idTimeMap[id] || ""),
                );
            }
        });
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
        const currentBaseUrl = window.location.origin +
            window.location.pathname + window.location.search;

        const myHighlightUrl = `${currentBaseUrl}#:~:text=${id}`;

        window.open(
            `https://github.com/CollegesChat/university-information/issues/new?template=malicious_data.yml&title=${
                encodeURIComponent(`[数据举报]：${id}`)
            }&target=${
                encodeURIComponent(
                    document.querySelector('meta[itemprop="name"]').content,
                )
            }&extra=${encodeURIComponent(myHighlightUrl)}`,
            "_blank",
        );
    }

    document.addEventListener("touchstart", (e) => {
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
    }, { passive: true });
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
            document.querySelectorAll(".id-link.show-tip").forEach((node) =>
                node.classList.remove("show-tip")
            );
            if (!hasTip) {
                el.classList.add("show-tip");
            }
        }
    });

    // 手指在屏幕上滑动时，取消长按判定
    document.addEventListener("touchmove", () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }, { passive: true });

    // 点击页面其他空白处时，隐藏手机上的日期气泡
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".id-link")) {
            document.querySelectorAll(".id-link.show-tip").forEach((node) =>
                node.classList.remove("show-tip")
            );
        }
    });
    initParagraphFolder();
});
