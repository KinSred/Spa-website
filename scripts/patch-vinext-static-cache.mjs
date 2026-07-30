import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const target = fileURLToPath(
  new URL("../node_modules/vinext/dist/server/static-file-cache.js", import.meta.url),
);

const replacements = [
  {
    from: 'const isHashed = relativePath.startsWith("assets/");',
    to: 'const isHashed = relativePath.split(path.sep).join("/").startsWith("assets/");',
  },
  {
    from: 'const pathname = "/" + relativePath;',
    to: 'const pathname = "/" + relativePath.split(path.sep).join("/");',
  },
];

let source;

try {
  source = await readFile(target, "utf8");
} catch (error) {
  if (error?.code === "ENOENT") {
    console.warn("[postinstall] vinext chưa có; bỏ qua bản vá static cache.");
    process.exit(0);
  }
  throw error;
}

let patched = source;

for (const replacement of replacements) {
  if (patched.includes(replacement.to)) {
    continue;
  }
  if (!patched.includes(replacement.from)) {
    throw new Error(
      `[postinstall] Không tìm thấy đoạn vinext cần vá: ${replacement.from}`,
    );
  }
  patched = patched.replace(replacement.from, replacement.to);
}

if (patched !== source) {
  await writeFile(target, patched, "utf8");
  console.log("[postinstall] Đã chuẩn hóa đường dẫn static asset của vinext trên Windows.");
} else {
  console.log("[postinstall] Static asset của vinext đã được chuẩn hóa.");
}
