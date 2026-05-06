import { defineConfig } from "vite";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/libs/utilities",
  plugins: [nxViteTsPaths()],
  build: {
    outDir: "../../dist/libs/utilities",
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: "src/index.ts",
      name: "ui",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    reporters: ["default", "json"],
    outputFile: "../../coverage/libs/utilities/report.json",
    coverage: {
      reportsDirectory: "../../coverage/libs/utilities",
      provider: "v8",
    },
  },
});
