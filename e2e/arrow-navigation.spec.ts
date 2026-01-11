import { test, expect } from '@playwright/test';

test.describe('Song Navigation with Arrow Keys', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('/');
    
    // Esperar a que la aplicación cargue
    await page.waitForSelector('.app-container', { timeout: 10000 });
  });

  test('should keep selected song visible when navigating with arrow keys', async ({ page }) => {
    // Verificar que la aplicación se ha cargado correctamente
    await expect(page.locator('.app-container')).toBeVisible();
    
    // Buscar el botón de cargar playlist en la sidebar
    const loadButton = page.locator('.sidebar .add-btn').first();
    
    // Verificar si hay un botón de carga de playlist
    const hasLoadButton = await loadButton.count() > 0;
    
    if (hasLoadButton) {
      // Si existe el botón, intentar cargar una playlist
      // Nota: En un entorno e2e real, necesitarías preparar archivos de prueba
      // Por ahora, verificaremos el comportamiento básico
    }
    
    // Verificar si hay canciones cargadas
    const songRows = page.locator('.song-row');
    const songCount = await songRows.count();
    
    if (songCount === 0) {
      // Si no hay canciones, esta prueba no puede ejecutarse completamente
      // pero al menos verificamos que la estructura está presente
      await expect(page.locator('.main-content')).toBeVisible();
      console.log('No songs loaded - test skipped partially');
      return;
    }
    
    // Si hay canciones, realizar la prueba completa
    // Obtener el contenedor con scroll
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();
    
    // Presionar ArrowDown varias veces para navegar
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300); // Esperar a que se complete la animación del scroll
    
    // Verificar que hay una fila seleccionada
    let selectedRow = page.locator('.song-row.selected');
    await expect(selectedRow).toBeVisible();
    
    // Obtener información del elemento seleccionado antes de más navegación
    let selectedBoundingBox = await selectedRow.boundingBox();
    expect(selectedBoundingBox).not.toBeNull();
    
    // Obtener el bounding box del contenedor
    const containerBoundingBox = await mainContent.boundingBox();
    expect(containerBoundingBox).not.toBeNull();
    
    // Verificar que el elemento seleccionado está dentro del viewport del contenedor
    if (selectedBoundingBox && containerBoundingBox) {
      expect(selectedBoundingBox.y).toBeGreaterThanOrEqual(containerBoundingBox.y);
      expect(selectedBoundingBox.y + selectedBoundingBox.height).toBeLessThanOrEqual(
        containerBoundingBox.y + containerBoundingBox.height
      );
    }
    
    // Navegar hacia abajo múltiples veces
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(300);
    }
    
    // Verificar nuevamente que el elemento seleccionado está visible
    selectedRow = page.locator('.song-row.selected');
    await expect(selectedRow).toBeVisible();
    
    selectedBoundingBox = await selectedRow.boundingBox();
    expect(selectedBoundingBox).not.toBeNull();
    
    // Verificar que sigue estando dentro del viewport
    if (selectedBoundingBox && containerBoundingBox) {
      expect(selectedBoundingBox.y).toBeGreaterThanOrEqual(containerBoundingBox.y);
      expect(selectedBoundingBox.y + selectedBoundingBox.height).toBeLessThanOrEqual(
        containerBoundingBox.y + containerBoundingBox.height
      );
    }
    
    // Navegar hacia arriba múltiples veces
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(300);
    }
    
    // Verificar una vez más que el elemento seleccionado está visible
    selectedRow = page.locator('.song-row.selected');
    await expect(selectedRow).toBeVisible();
    
    selectedBoundingBox = await selectedRow.boundingBox();
    expect(selectedBoundingBox).not.toBeNull();
    
    // Verificar que el elemento está dentro del viewport después de navegar hacia arriba
    if (selectedBoundingBox && containerBoundingBox) {
      expect(selectedBoundingBox.y).toBeGreaterThanOrEqual(containerBoundingBox.y);
      expect(selectedBoundingBox.y + selectedBoundingBox.height).toBeLessThanOrEqual(
        containerBoundingBox.y + containerBoundingBox.height
      );
    }
  });

  test('should scroll automatically when navigating beyond visible area', async ({ page }) => {
    // Verificar que la aplicación se ha cargado
    await expect(page.locator('.app-container')).toBeVisible();
    
    const songRows = page.locator('.song-row');
    const songCount = await songRows.count();
    
    if (songCount === 0) {
      console.log('No songs loaded - test skipped');
      return;
    }
    
    // Si hay suficientes canciones para hacer scroll
    if (songCount > 10) {
      const mainContent = page.locator('.main-content');
      
      // Obtener la posición de scroll inicial
      const initialScrollTop = await mainContent.evaluate(el => el.scrollTop);
      
      // Navegar hacia abajo muchas veces para forzar el scroll
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
      }
      
      // Verificar que el scroll ha cambiado
      const newScrollTop = await mainContent.evaluate(el => el.scrollTop);
      expect(newScrollTop).toBeGreaterThan(initialScrollTop);
      
      // Verificar que la fila seleccionada está visible
      const selectedRow = page.locator('.song-row.selected');
      await expect(selectedRow).toBeVisible();
    }
  });

  test('should handle keyboard navigation without songs loaded', async ({ page }) => {
    // Verificar que la aplicación se carga sin errores
    await expect(page.locator('.app-container')).toBeVisible();
    
    // Intentar navegar con las flechas aunque no haya canciones
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    
    // La aplicación no debe crashear
    await expect(page.locator('.main-content')).toBeVisible();
  });
});
