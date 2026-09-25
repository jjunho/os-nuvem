import { test, expect } from "@playwright/test";
import pg from "pg";
import { DATABASE_URL_TEST } from "../../playwright.config";
import { reiniciar, entrarComo } from "./apoio";
test("300 mil mensagens: leitura <100 ms e entrega <300 ms", async ({
  page,
  browser,
}) => {
  test.setTimeout(90000);
  await reiniciar(page);
  await entrarComo(page, "carlos");
  const banco = new pg.Pool({ connectionString: DATABASE_URL_TEST });
  try {
    await banco.query(
      `insert into usuarios(nome,email,senha_hash,papel) select 'Usuário '||n,'volume'||n||'@example.invalid',u.senha_hash,'conteudo' from generate_series(1,30) n cross join (select senha_hash from usuarios limit 1) u`,
    );
    await banco.query(
      `insert into conversas(chave,tipo,nome,criador_id,privada) select 'volume:'||n,'grupo','Grupo '||n,1,false from generate_series(1,300) n`,
    );
    await banco.query(
      `insert into membros_conversa(conversa_id,usuario_id) select c.id,u.id from conversas c cross join usuarios u`,
    );
    await banco.query(
      `insert into mensagens(client_id,conversa_id,autor_id,texto) select 'volume-mensagem-'||n,1+(n%300),1,'Mensagem operacional 서울 '||n from generate_series(1,300000) n`,
    );
    await banco.query("analyze mensagens");
    await banco.query("analyze membros_conversa");
  } finally {
    await banco.end();
  }
  const ctx = await browser.newContext(),
    lia = await ctx.newPage();
  await entrarComo(lia, "lia");
  for (const url of [
    "/comunicador/api?conversa=1",
    "/comunicador/api?busca=operacional",
  ]) {
    await page.request.get(url);
    const inicio = performance.now();
    expect((await page.request.get(url)).ok()).toBeTruthy();
    expect(performance.now() - inicio, url).toBeLessThan(100);
  }
  await page.getByRole("button", { name: "Comunicador", exact: true }).click();
  await lia.getByRole("button", { name: "Comunicador", exact: true }).click();
  await page.getByLabel("Conversa direta").selectOption({ label: "Lia" });
  await page.getByRole("button", { name: "Iniciar conversa" }).click();
  await lia.getByRole("button", { name: "Carlos", exact: true }).click();
  await page
    .getByLabel("Mensagem", { exact: true })
    .fill("Resposta de velocidade");
  const start = performance.now();
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(
    page.getByText("Resposta de velocidade", { exact: true }),
  ).toBeVisible();
  expect(performance.now() - start).toBeLessThan(100);
  await expect(
    lia.getByText("Resposta de velocidade", { exact: true }),
  ).toBeVisible();
  expect(performance.now() - start).toBeLessThan(300);
  await ctx.close();
});
