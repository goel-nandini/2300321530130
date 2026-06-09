const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

const VALID_STACKS = ["frontend"];

const VALID_LEVELS = [
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
];

const VALID_PACKAGES = [
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
  "auth",
  "config",
  "middleware",
  "utils",
];

export const Log = async (
  level,
  packageName,
  message
) => {
  try {
    if (!VALID_LEVELS.includes(level)) {
      throw new Error(`Invalid level: ${level}`);
    }

    if (!VALID_PACKAGES.includes(packageName)) {
      throw new Error(`Invalid package: ${packageName}`);
    }

    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        
      },
      body: JSON.stringify({
        stack: "frontend",
        level,
        package: packageName,
        message,
      }),
    });

    return response;
  } catch (error) {
    console.error("Logger Error:", error.message);
  }
};