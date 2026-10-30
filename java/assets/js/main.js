/* =========================================================
 * main.js — 页面交互逻辑
 *  - 导航栏滚动态
 *  - 移动端菜单
 *  - 平滑锚点滚动
 *  - 滚动入场动画
 *  - 数字滚动统计
 *  - 服务/案例动态渲染（来自 api.js）
 *  - 联系表单提交（对接后端或演示模式）
 * 依赖：api.js 中定义的 window.API
 * ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initMobileMenu();
  initReveal();
  initCounters();
  renderDynamic();
  initContactForm();
});

/* ---------- 导航栏滚动态 ---------- */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- 移动端菜单 ---------- */
function initMobileMenu() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

/* ---------- 滚动入场动画 ---------- */
function initReveal() {
  const targets = document.querySelectorAll(
    ".section, .service-card, .case-card, .value-card, .contact-form, .contact-info"
  );
  targets.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  targets.forEach((el) => io.observe(el));
}

/* ---------- 数字滚动统计 ---------- */
function initCounters() {
  const nums = document.querySelectorAll(".stat-num");
  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const val = Math.floor((1 - Math.pow(1 - p, 3)) * target);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  nums.forEach((n) => io.observe(n));
}

/* ---------- 动态渲染服务 / 案例 ---------- */
async function renderDynamic() {
  if (!window.API) return;

  // 服务
  try {
    const services = await window.API.getServices();
    const grid = document.getElementById("servicesGrid");
    if (grid && services && services.length) {
      grid.innerHTML = services
        .map(
          (s) => `
        <div class="service-card">
          <div class="service-icon">${s.icon || "💡"}</div>
          <h3>${escapeHtml(s.title)}</h3>
          <p>${escapeHtml(s.desc)}</p>
        </div>`
        )
        .join("");
    }
  } catch (e) {
    console.warn("获取服务列表失败，使用默认内容：", e);
  }

  // 案例
  try {
    const cases = await window.API.getCases();
    const grid = document.getElementById("casesGrid");
    if (grid && cases && cases.length) {
      grid.innerHTML = cases
        .map(
          (c) => `
        <article class="case-card">
          <div class="case-thumb ${c.grad || "case-a"}"><span>${escapeHtml(c.tag || "")}</span></div>
          <div class="case-body">
            <h3>${escapeHtml(c.title)}</h3>
            <p>${escapeHtml(c.desc)}</p>
            <span class="case-tag">${escapeHtml(c.tag || "")}</span>
          </div>
        </article>`
        )
        .join("");
    }
  } catch (e) {
    console.warn("获取案例列表失败，使用默认内容：", e);
  }
}

/* ---------- 联系表单 ---------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const hint = document.getElementById("formHint");
  const btn = document.getElementById("submitBtn");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hint.className = "form-hint";
    hint.textContent = "";

    const data = {
      name: form.name.value.trim(),
      company: form.company.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    };

    if (!data.name || !data.phone || !data.message) {
      hint.classList.add("err");
      hint.textContent = "请填写带 * 的必填项（姓名、电话、需求描述）。";
      return;
    }
    if (data.phone && !/^1[3-9]\d{9}$/.test(data.phone)) {
      hint.classList.add("err");
      hint.textContent = "手机号格式不正确，请检查。";
      return;
    }

    btn.disabled = true;
    btn.textContent = "提交中...";
    try {
      const res = await window.API.submitContact(data);
      hint.classList.add("ok");
      hint.textContent = (res && res.message) || "提交成功，我们会尽快与您联系！";
      form.reset();
    } catch (err) {
      hint.classList.add("err");
      hint.textContent = "提交失败，请稍后重试或直接拨打商务热线 400-888-0000。";
    } finally {
      btn.disabled = false;
      btn.textContent = "提交咨询";
    }
  });
}

/* ---------- 工具：HTML 转义，防止 XSS ---------- */
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
