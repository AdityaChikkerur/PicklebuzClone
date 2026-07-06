import { test, expect, type Page } from "@playwright/test";

async function startDemoSession(page: Page) {
  const res = await page.request.post("/api/auth/demo-session", {
    data: { role: "player" },
  });
  expect(res.ok()).toBeTruthy();
}

async function completeMatchSetup(page: Page) {
  await page.goto("/match-setup");

  await page.getByRole("button", { name: "Singles" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page
    .getByRole("button", { name: /Add player to Team A slot 1/i })
    .click();
  await page.getByRole("button", { name: "Priya Sharma" }).click();

  await page
    .getByRole("button", { name: /Add player to Team B slot 1/i })
    .click();
  await page.getByRole("button", { name: "Arjun Mehta" }).click();

  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Smash Arena" }).click();
  await page.getByRole("switch", { name: "Toggle referee for this match" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Best of 3" }).click();
  await page.getByRole("button", { name: "Custom" }).click();
  await page.getByRole("spinbutton", { name: "Custom points to win" }).fill("1");
  await page.getByRole("button", { name: "Win by 1" }).click();
  await page.getByRole("button", { name: "Start Live Scoring" }).click();

  await expect(page).toHaveURL(/\/live-scoring/);
}

test.describe("Phase 2 — live scoring flow (demo mode)", () => {
  test.beforeEach(async ({ page }) => {
    await startDemoSession(page);
  });

  test("match setup → score → end match → summary", async ({ page }) => {
    await completeMatchSetup(page);

    await page.getByRole("button", { name: "Point for Team A" }).click();
    await expect(page.locator(".score-display").first()).toHaveText("1");

    await page.getByRole("button", { name: "Save & Exit" }).click();

    await expect(page).toHaveURL(/\/match\//);
    await expect(
      page.getByText(/Awaiting opponent confirmation|Match not found/i)
    ).toBeVisible();
  });

  test("spectator page loads for demo live match", async ({ page }) => {
    await page.goto("/spectate/m-live");
    await expect(page.getByText("Spectating")).toBeVisible();
    await expect(page.locator(".badge-live")).toBeVisible();
  });
});

test.describe("Phase 2 — Supabase realtime (optional)", () => {
  test.skip(
    !process.env.E2E_SUPABASE_URL,
    "Set E2E_SUPABASE_URL to run against production Supabase"
  );

  test("two browsers share live score updates", async ({ browser }) => {
    const scorer = await browser.newPage();
    const spectator = await browser.newPage();

    await startDemoSession(scorer);
    await completeMatchSetup(scorer);

    const spectateLink = scorer.getByRole("link", { name: "Spectate" });
    await expect(spectateLink).toBeVisible();
    const href = await spectateLink.getAttribute("href");
    expect(href).toMatch(/^\/spectate\//);

    await spectator.goto(href!);
    await expect(spectator.locator(".score-display").first()).toHaveText("0");

    await scorer.getByRole("button", { name: "Point for Team A" }).click();
    await expect(scorer.locator(".score-display").first()).toHaveText("1");
    await expect(spectator.locator(".score-display").first()).toHaveText("1", {
      timeout: 10_000,
    });
  });
});
