import { chromium, type Browser } from "playwright";
let navegador: Promise<Browser> | undefined;
export async function gerarPDF(html: string) {
  navegador ??= chromium.launch({ headless: true }).catch((e) => {
    navegador = undefined;
    throw e;
  });
  const browser = await navegador;
  const pagina = await browser.newPage();
  try {
    await pagina.setContent(html, { waitUntil: "load" });
    return await pagina.pdf({ format: "A4", printBackground: true });
  } finally {
    await pagina.close();
  }
}
