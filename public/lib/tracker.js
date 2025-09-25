(() => {
var y = Object.defineProperty;
var w = (t, e, a) => e in t ? y(t, e, { enumerable: !0, configurable: !0, writable: !0, value: a }) : t[e] = a;
var r = (t, e, a) => w(t, typeof e != "symbol" ? e + "" : e, a);
function m(t) {
  const e = history.pushState;
  let a = location.pathname;
  history.pushState = function(s, i) {
    e.apply(this, arguments), location.pathname !== a && (a = location.pathname, t());
  };
  const n = () => {
    location.pathname !== a && (a = location.pathname, t());
  };
  return addEventListener("popstate", n), () => {
    history.pushState = e, removeEventListener("popstate", n);
  };
}
const v = 1e4;
function u(t, e, a) {
  const n = new XMLHttpRequest();
  n.open("GET", t, !0), n.timeout = v, n.setRequestHeader("Content-Type", "text/plain"), n.onload = () => n.status === 200 ? e(n.responseText) : a == null ? void 0 : a(), a && (n.onerror = n.ontimeout = a), n.send();
}
function U(t) {
  return "?" + Object.keys(t).map((e) => encodeURIComponent(e) + "=" + encodeURIComponent(t[e])).join("&");
}
function T(t, e) {
  const a = { ht: 1 };
  return new Promise((n) => {
    const s = `${t.replace(/\/collect$/, "/cache")}?sid=${encodeURIComponent(e)}`;
    u(
      s,
      (i) => {
        try {
          n(JSON.parse(i));
        } catch {
          n(a);
        }
      },
      () => n(a)
    );
  });
}
function b(t, e) {
  u(t + U(e), () => {
  });
}
function k(t, e, a) {
  u(
    t,
    e,
    a ? () => a("Request failed") : void 0
  );
}
function A(t) {
  const e = m(() => {
    p(t);
  });
  return p(t), e;
}
function I() {
  const t = document.querySelector(
    'link[rel="canonical"][href]'
  );
  if (!t)
    return null;
  const e = document.createElement("a");
  return e.href = t.href, e;
}
function P(t) {
  const e = document.createElement("a");
  e.href = t;
  const a = e.protocol + "//" + e.hostname, n = e.pathname;
  return { hostname: a, path: n };
}
function D(t, e) {
  return !e && document.referrer.indexOf(t) < 0 && (e = document.referrer), e.split("?")[0];
}
async function p(t, e = {}) {
  const n = I() ?? window.location;
  if (n.host === "" && navigator.userAgent.indexOf("Electron") < 0)
    return;
  const s = e.url || n.pathname + n.search || "/", { hostname: i, path: o } = P(s), g = D(i, e.referrer || ""), l = {
    p: o,
    h: i,
    r: g,
    sid: t.siteId
  };
  try {
    const S = await T(
      t.reporterUrl,
      t.siteId
    );
    Object.assign(l, {
      ht: S.ht.toString()
    });
  } catch {
  }
  b(t.reporterUrl, l);
}
const c = (t, e) => {
  const a = document.getElementById(t);
  a && (a.textContent = e);
}, d = (t, e, a) => {
  const n = t.replace(/\/collect$/, "/stats"), s = new URLSearchParams({
    site: e,
    interval: "90d",
    timezone: "UTC"
  });
  a && s.append("path", a), k(
    `${n}?${s}`,
    (i) => {
      try {
        const o = JSON.parse(i);
        o.code === 200 && o.data && (c("site_pv", o.data.siteViews.toString()), c("site_uv", o.data.siteVisitors.toString()), c("page_pv", o.data.pageViews.toString()), c("page_uv", o.data.pageVisitors.toString()));
      } catch (o) {
        console.warn("Failed to parse stats response:", o);
      }
    },
    (i) => console.warn(`Failed to fetch stats data: ${i}`)
  );
};
function R(t) {
  const e = m(() => {
    t.enableStatsDisplay && d(t.reporterUrl, t.siteId, location.pathname);
  });
  return t.enableStatsDisplay && d(t.reporterUrl, t.siteId, location.pathname), e;
}
class _ {
  constructor(e) {
    r(this, "siteId");
    r(this, "reporterUrl");
    r(this, "enableStatsDisplay");
    r(this, "_cleanupAutoTrackPageviews");
    r(this, "_cleanupAutoStatsDisplay");
    this.siteId = e.siteId, this.reporterUrl = e.reporterUrl, this.enableStatsDisplay = e.enableStatsDisplay ?? !0, (e.autoTrackPageviews === void 0 || e.autoTrackPageviews) && setTimeout(() => {
      this._cleanupAutoTrackPageviews = A(this);
    }, 0), this.enableStatsDisplay && setTimeout(() => {
      this._cleanupAutoStatsDisplay = R(this);
    }, 0);
  }
  cleanup() {
    this._cleanupAutoTrackPageviews && this._cleanupAutoTrackPageviews(), this._cleanupAutoStatsDisplay && this._cleanupAutoStatsDisplay();
  }
}
const h = {
  client: void 0
};
function C(t) {
  if (h.client)
    throw new Error("Counterscale has already been initialized.");
  h.client = new _(t);
}
function O() {
  return document.getElementById(
    "counterscale-script"
  );
}
function f() {
  const t = O(), e = t == null ? void 0 : t.getAttribute("data-site-id"), a = (t == null ? void 0 : t.getAttribute("data-auto-track-pageviews")) !== "false", n = (t == null ? void 0 : t.getAttribute("data-enable-stats-display")) !== "false", s = (t == null ? void 0 : t.getAttribute("data-reporter-url")) || (t == null ? void 0 : t.src.replace("tracker.js", "collect"));
  !e || !s || C({
    siteId: e,
    reporterUrl: s,
    autoTrackPageviews: a,
    enableStatsDisplay: n
  });
}
(function() {
  if (document.body === null) {
    document.addEventListener("DOMContentLoaded", () => {
      f();
    });
    return;
  }
  f();
})();
})()