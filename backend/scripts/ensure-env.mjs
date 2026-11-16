import { copyFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const examplePath = resolve(".env.example");
const envPath = resolve(".env");

try {
  await readFile(envPath, "utf8");
} catch (error) {
  if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
    throw error;
  }

  await copyFile(examplePath, envPath);
  console.error(
    "Created backend/.env from .env.example. Edit its required values, then run npm run dev again.",
  );
  process.exitCode = 1;
}

if (process.exitCode !== 1) {
  const contents = await readFile(envPath, "utf8");
  const required = new Map([
    ["DATABASE_URL", ["change-me"]],
    ["JWT_ACCESS_SECRET", ["replace-with"]],
    ["JWT_REFRESH_SECRET", ["replace-with"]],
  ]);
  const values = new Map(
    contents
      .split(/\r?\n/)
      .map((line) => {
        const separator = line.indexOf("=");
        return separator < 0
          ? null
          : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      })
      .filter((entry) => entry !== null),
  );

  const missing = [];
  for (const [key, markers] of required) {
    const value = values.get(key);
    if (
      !value ||
      markers.some((marker) => value.toLowerCase().includes(marker.toLowerCase()))
    ) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(
      `Set real local values for ${missing.join(", ")} in backend/.env before starting the API.`,
    );
    process.exitCode = 1;
  }
}
