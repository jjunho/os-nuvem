import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";

test.beforeEach(async ({ page }) => {
  await reiniciar(page);
});

test("o usuário escolhe coreano e a preferência persiste ao entrar novamente", async ({
  page,
}) => {
  await entrarComo(page, "Carlos");
  await page.getByLabel("Idioma da interface").selectOption("ko");
  await expect(page.getByRole("heading", { name: "파이프라인" })).toBeVisible();
  await page.getByRole("button", { name: "로그아웃", exact: true }).click();
  await page.getByLabel("이메일").fill("carlos@corealux.com");
  await page.getByLabel("비밀번호", { exact: true }).fill("corealux123");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.getByRole("heading", { name: "파이프라인" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await page.getByLabel("인터페이스 언어").selectOption("pt");
  await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
});

test("a viagem, formulário e busca seguem o catálogo coreano sem traduzir os dados pessoais", async ({
  page,
}) => {
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Maria Silva" });
  await page.getByLabel("Idioma da interface").selectOption("ko");
  await expect(
    page.getByRole("heading", { name: "연락처", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "고객 프로필: Maria Silva",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByTestId("etapa")).toHaveText("리드");
  await page.getByRole("link", { name: "새 여행" }).click();
  await expect(page.getByLabel("연락처 이름")).toBeVisible();
  await page.getByRole("combobox", { name: "판매 채널", exact: true }).fill("");
  await expect(
    page.getByRole("option", { name: "여행사", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "검색", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "여행 검색" })).toBeVisible();
});
