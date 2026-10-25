import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const output = await mkdtemp(join(tmpdir(), "portfolio-writing-tests-"));

try {
  await build({
    configFile: false,
    logLevel: "error",
    resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
    ssr: { noExternal: true },
    build: {
      ssr: "tests/writing.test.mjs",
      outDir: output,
      emptyOutDir: false,
      rollupOptions: { output: { entryFileNames: "writing.test.mjs" } },
    },
  });

  process.exitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--test", join(output, "writing.test.mjs")], {
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
} finally {
  await rm(output, { recursive: true, force: true });
}
