const BASE = "/api";
function getCookie(name) {
  const v = document.cookie.match("(^|;)\s*" + name + "\s*=\s*([^;]+)");
  return v ? v.pop() : "";
}
async function request(url, opts = {}) {
  const res = await fetch(BASE + url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRFToken": getCookie("csrftoken"), ...opts.headers },
    ...opts,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  return data;
}
export const api = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: "POST", body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: "PUT", body: JSON.stringify(body) }),
  del: (url) => request(url, { method: "DELETE" }),
  upload: (url, formData) =>
    fetch(BASE + url, { method: "POST", credentials: "include", headers: { "X-CSRFToken": getCookie("csrftoken") }, body: formData }).then(r => r.json()),
};
