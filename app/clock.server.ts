// The only source of "now" on the server. In test mode a request may carry
// an `x-test-now` cookie so tests can move time forward.
export function now(request?: Request): Date {
  if (process.env.TEST_MODE === "1" && request) {
    const match = /(?:^|;\s*)x-test-now=([^;]+)/.exec(request.headers.get("cookie") ?? "");
    if (match) return new Date(decodeURIComponent(match[1]));
  }
  return new Date();
}
