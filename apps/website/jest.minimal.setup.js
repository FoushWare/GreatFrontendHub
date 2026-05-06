// Minimal setup for Jest runs to avoid recursive setup complexity.
// Provides minimal Web API shims and a small `vi` shim mapped to Jest.
if (!globalThis.Headers) {
  globalThis.Headers = class Headers {
    constructor(init = {}) {
      this._map = {};
      Object.entries(init || {}).forEach(
        ([k, v]) => (this._map[k.toLowerCase()] = String(v)),
      );
    }
    get(name) {
      return this._map[name.toLowerCase()];
    }
    set(name, value) {
      this._map[name.toLowerCase()] = String(value);
    }
    entries() {
      return Object.entries(this._map)[Symbol.iterator]();
    }
    [Symbol.iterator]() {
      return this.entries();
    }
  };
}

if (!globalThis.Request) {
  globalThis.Request = class Request {
    constructor(input, init = {}) {
      this._url = typeof input === "string" ? input : input?.url || "";
      this.method = init.method || "GET";
      this.headers = new globalThis.Headers(init.headers || {});
      this._body = init.body;
    }
    get url() {
      return this._url;
    }
    async json() {
      if (!this._body) {
        return {};
      }

      if (typeof this._body === "string") {
        return JSON.parse(this._body);
      }

      return this._body;
    }
  };
}

if (!globalThis.Response) {
  globalThis.Response = class Response {
    constructor(body, init = {}) {
      this._body = body;
      this.status = init.status || 200;
      this.headers = new globalThis.Headers(init.headers || {});
    }
    async json() {
      if (typeof this._body === "string") {
        try {
          return JSON.parse(this._body);
        } catch {
          return {};
        }
      }
      return this._body;
    }
  };
}

if (!globalThis.vi) {
  globalThis.vi = {
    fn: (...args) => jest.fn(...args),
    spyOn: (...args) => jest.spyOn(...args),
    mock: (m, f) => {
      if (typeof globalThis !== "undefined" && globalThis.jest?.mock) {
        globalThis.jest.mock(m, f);
      }
    },
    clearAllMocks: () =>
      jest.clearAllMocks ? jest.clearAllMocks() : undefined,
    resetModules: () => (jest.resetModules ? jest.resetModules() : undefined),
    stubEnv: (name, value) => {
      if (!globalThis.__originalEnv)
        globalThis.__originalEnv = { ...process.env };
      process.env[name] = value;
    },
    unstubAllEnvs: () => {
      if (globalThis.__originalEnv) {
        process.env = { ...globalThis.__originalEnv };
      }
    },
  };
}
