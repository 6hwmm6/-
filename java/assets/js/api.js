/* =========================================================
 * api.js — 前端与 Java(Spring Boot) 后端的接口层
 * ---------------------------------------------------------
 * 设计目标：
 *   1. 站点默认使用内置「演示数据」离线运行，无需后端即可查看效果；
 *   2. 接入真实 Java 后端时，只需把 CONFIG.apiBaseUrl 改成后端地址
 *      （如 "http://localhost:8080" 或上线后的域名），并打开 CONFIG.useBackend；
 *   3. 所有后端约定的请求/响应格式都写在注释里，方便与后端对齐。
 *
 * 推荐的后端对接方式（Spring Boot 静态资源托管）：
 *   - 将本前端目录放到 Spring Boot 的 src/main/resources/static/ 下，
 *     由 Spring 直接托管这些静态页面；
 *   - 后端提供 /api/** 的 REST 接口，前端用相对路径调用即可。
 * ========================================================= */

const CONFIG = {
  // 后端基础地址。留空字符串 "" 表示同源（即由当前服务器提供 API，适合 Spring Boot 托管）。
  apiBaseUrl: "",
  // 是否使用真实后端。false 时使用下方内置演示数据。
  useBackend: false,
};

/* 内置演示数据（接入后端后可忽略） */
const MOCK = {
  services: [
    { icon: "☁️", title: "云原生平台", desc: "容器化、微服务与多活架构，助您构建弹性可扩展的云基础设施。" },
    { icon: "📊", title: "数据中台", desc: "统一数据资产，打通业务孤岛，让数据真正驱动经营决策。" },
    { icon: "🤖", title: "AI 智能应用", desc: "智能客服、预测分析与大模型应用，释放 AI 生产力红利。" },
    { icon: "🛡️", title: "安全合规", desc: "等保合规、零信任架构与全链路审计，守护企业数字资产。" },
    { icon: "🔧", title: "DevOps 交付", desc: "自动化流水线与企业级研发效能平台，加速产品迭代。" },
    { icon: "📱", title: "数字化门户", desc: "面向多端的企业门户与运营平台，连接内部与外部用户。" },
  ],
  cases: [
    { tag: "金融", grad: "case-a", title: "某股份制银行数据中台", desc: "统一 12 个业务系统数据，报表时效从 T+1 提升至实时，决策效率提升 40%。" },
    { tag: "制造", grad: "case-b", title: "头部车企智能工厂", desc: "AI 质检替代人工目检，缺陷识别准确率达 99.6%，年节约成本超千万。" },
    { tag: "零售", grad: "case-c", title: "连锁零售全渠道中台", desc: "打通线上线下会员与库存，复购率提升 28%，新店上线周期缩短一半。" },
  ],
};

/* 统一的请求封装：自动拼接基础路径，失败向上抛出由调用方处理 */
async function request(path, options = {}) {
  const url = CONFIG.apiBaseUrl + path;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

/* =========================================================
 * 对外接口（前端页面只调用这些函数）
 * ========================================================= */

/**
 * 获取服务/产品列表
 * 后端约定：GET /api/services
 * 响应：[{ "icon": "☁️", "title": "云原生平台", "desc": "..." }, ...]
 */
async function getServices() {
  if (!CONFIG.useBackend) return MOCK.services;
  return request("/api/services");
}

/**
 * 获取客户案例列表
 * 后端约定：GET /api/cases
 * 响应：[{ "tag":"金融", "grad":"case-a", "title":"...", "desc":"..." }, ...]
 * 说明：grad 为前端样式类名（case-a/case-b/case-c），后端可固定返回。
 */
async function getCases() {
  if (!CONFIG.useBackend) return MOCK.cases;
  return request("/api/cases");
}

/**
 * 提交联系表单
 * 后端约定：POST /api/contact
 * 请求体：{ "name": "张三", "company": "xx公司", "phone": "138...", "email": "a@b.com", "message": "..." }
 * 响应：{ "success": true, "message": "提交成功" }
 */
async function submitContact(payload) {
  if (!CONFIG.useBackend) {
    // 演示模式：仅打印并模拟成功，不真正发送
    console.log("[演示模式] 表单数据将提交至后端：", payload);
    return { success: true, message: "演示提交成功（未连接后端）" };
  }
  return request("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* 暴露为全局函数，供 main.js 使用 */
window.API = { getServices, getCases, submitContact, CONFIG };
