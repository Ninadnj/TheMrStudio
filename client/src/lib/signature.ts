/**
 * The maker's note — signed in the developer console, where clients never look
 * and other developers always do. The second line keeps the console's own text
 * colour so it reads in light and dark DevTools.
 */
export function signConsole() {
  console.log(
    "%cTHE MR Studio%c\n\nDesigned and built by Nina DNJ, Paris.\nhttps://ninadnj.github.io/Portfolio_2026/",
    "font: italic 28px Georgia, 'Times New Roman', serif; color: #A8875A; padding: 6px 0;",
    "font: 13px/1.7 -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;"
  );
}
