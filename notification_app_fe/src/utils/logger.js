export function Log(level, module, message) {
  console.log(`[${level.toUpperCase()}] [${module}] ${message}`);
}
