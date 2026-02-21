import { test, expect } from '@playwright/test';

test.describe('Atelier Ukulélé Canopée', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('doit afficher le titre correct', async ({ page }) => {
    const header = page.locator('h1');
    const text = await header.innerText();
    // On passe tout en minuscules pour ignorer le style CSS uppercase
    const lowerText = text.toLowerCase();
    const isValid = lowerText.includes('atelier diagrammes ukulélé') || lowerText.includes('ukulele chord workshop');
    expect(isValid).toBe(true);
  });

  test('doit afficher les alternatives lors d une recherche', async ({ page }) => {
    const input = page.locator('#name');
    await input.fill('G7');
    await input.press('Enter');

    const alternativesTitle = page.locator('#alternatives-title');
    await expect(alternativesTitle).toBeVisible();
    await expect(alternativesTitle).toContainText(/Suggestions/);

    const thumbnails = page.locator('.diagram-thumbnail');
    await expect(thumbnails.first()).toBeVisible();
  });

  test('le wizard doit désactiver le dièse pour la note E', async ({ page }) => {
    await page.click('#toggle-assistant');
    
    // Cliquer sur la note E
    const btnE = page.locator('#assistant-roots button:has-text("E")');
    await btnE.click();

    // Attendre un court instant que le DOM se mette à jour
    const sharpBtn = page.locator('#assistant-accidentals .mini-btn[data-val="#"]');
    
    // Vérifier l'état désactivé
    await expect(sharpBtn).toBeDisabled();
  });
});
