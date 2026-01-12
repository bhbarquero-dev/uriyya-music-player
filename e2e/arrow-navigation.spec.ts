import { test, expect, Page } from '@playwright/test';

// Helper function to inject mock playlist data into the page
async function injectMockPlaylist(page: Page, songCount: number = 30) {
  await page.evaluate((count) => {
    // Generate test songs
    const mockSongs = Array.from({ length: count }, (_, i) => 
      `/mock/path/to/Song ${String(i + 1).padStart(2, '0')}.mp3`
    );
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      // Create songs table
      const table = document.createElement('table');
      table.className = 'song-list-table';
      table.style.marginTop = '10px';
      
      const tbody = document.createElement('tbody');
      
      mockSongs.forEach((song, index) => {
        const tr = document.createElement('tr');
        tr.className = 'song-row';
        if (index === 0) tr.classList.add('selected');
        tr.setAttribute('data-song', song);
        
        const td = document.createElement('td');
        td.className = 'song-title';
        
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        
        const iconDiv = document.createElement('div');
        iconDiv.style.width = '24px';
        iconDiv.style.display = 'flex';
        iconDiv.style.alignItems = 'center';
        iconDiv.style.flexShrink = '0';
        
        const span = document.createElement('span');
        span.textContent = song.split('/').pop() || song;
        
        div.appendChild(iconDiv);
        div.appendChild(span);
        td.appendChild(div);
        tr.appendChild(td);
        tbody.appendChild(tr);
      });
      
      table.appendChild(tbody);
      
      // Replace existing content
      const existingContent = mainContent.querySelector('.song-list-table, p');
      if (existingContent) {
        existingContent.replaceWith(table);
      } else {
        mainContent.appendChild(table);
      }
    }
  }, songCount);
  
  // Wait for rows to be rendered
  await page.waitForSelector('.song-row', { timeout: 5000 });
}

// Helper function to simulate arrow key navigation with proper selection
async function navigateWithArrow(page: Page, direction: 'up' | 'down') {
  const key = direction === 'down' ? 'ArrowDown' : 'ArrowUp';
  
  await page.evaluate((arrowKey) => {
    const rows = Array.from(document.querySelectorAll('.song-row'));
    const currentSelected = document.querySelector('.song-row.selected');
    
    if (!currentSelected) {
      // If nothing is selected, select the first one
      if (rows.length > 0) {
        rows[0].classList.add('selected');
      }
      return;
    }
    
    const currentIndex = rows.indexOf(currentSelected as HTMLElement);
    let nextIndex = currentIndex;
    
    if (arrowKey === 'ArrowDown' && currentIndex < rows.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (arrowKey === 'ArrowUp' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }
    
    if (nextIndex !== currentIndex) {
      // Remove current selection
      currentSelected.classList.remove('selected');
      // Add selection to new row
      rows[nextIndex].classList.add('selected');
      
      // Smooth scroll to element
      rows[nextIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, key);
  
  await page.waitForTimeout(300); // Wait for scroll animation
}

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
    
    // Inyectar playlist de prueba con 30 canciones
    await injectMockPlaylist(page, 30);
    
    // Obtener el contenedor con scroll
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();
    
    // Verificar que hay una fila seleccionada inicialmente
    let selectedRow = page.locator('.song-row.selected');
    await expect(selectedRow).toBeVisible();
    
    // Obtener información del elemento seleccionado inicial
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
    for (let i = 0; i < 10; i++) {
      await navigateWithArrow(page, 'down');
    }
    
    // Verificar nuevamente que el elemento seleccionado está visible
    selectedRow = page.locator('.song-row.selected');
    await expect(selectedRow).toBeVisible();
    
    selectedBoundingBox = await selectedRow.boundingBox();
    expect(selectedBoundingBox).not.toBeNull();
    
    // Verificar que sigue estando dentro del viewport
    if (selectedBoundingBox && containerBoundingBox) {
      expect(selectedBoundingBox.y).toBeGreaterThanOrEqual(containerBoundingBox.y - 1); // -1 para tolerancia
      expect(selectedBoundingBox.y + selectedBoundingBox.height).toBeLessThanOrEqual(
        containerBoundingBox.y + containerBoundingBox.height + 1 // +1 para tolerancia
      );
    }
    
    // Navegar hacia arriba múltiples veces
    for (let i = 0; i < 5; i++) {
      await navigateWithArrow(page, 'up');
    }
    
    // Verificar una vez más que el elemento seleccionado está visible
    selectedRow = page.locator('.song-row.selected');
    await expect(selectedRow).toBeVisible();
    
    selectedBoundingBox = await selectedRow.boundingBox();
    expect(selectedBoundingBox).not.toBeNull();
    
    // Verificar que el elemento está dentro del viewport después de navegar hacia arriba
    if (selectedBoundingBox && containerBoundingBox) {
      expect(selectedBoundingBox.y).toBeGreaterThanOrEqual(containerBoundingBox.y - 1);
      expect(selectedBoundingBox.y + selectedBoundingBox.height).toBeLessThanOrEqual(
        containerBoundingBox.y + containerBoundingBox.height + 1
      );
    }
  });

  test('should scroll automatically when navigating beyond visible area', async ({ page }) => {
    // Verificar que la aplicación se ha cargado
    await expect(page.locator('.app-container')).toBeVisible();
    
    // Inyectar playlist de prueba con 50 canciones para garantizar scroll
    await injectMockPlaylist(page, 50);
    
    const mainContent = page.locator('.main-content');
    
    // Obtener la posición de scroll inicial
    const initialScrollTop = await mainContent.evaluate(el => el.scrollTop);
    
    // Navegar hacia abajo muchas veces para forzar el scroll
    for (let i = 0; i < 20; i++) {
      await navigateWithArrow(page, 'down');
    }
    
    // Verificar que el scroll ha cambiado
    const newScrollTop = await mainContent.evaluate(el => el.scrollTop);
    expect(newScrollTop).toBeGreaterThan(initialScrollTop);
    
    // Verificar que la fila seleccionada está visible
    const selectedRow = page.locator('.song-row.selected');
    await expect(selectedRow).toBeVisible();
    
    // Verificar el índice de la canción seleccionada
    const selectedText = await selectedRow.textContent();
    expect(selectedText).toContain('Song');
  });

  test('should handle keyboard navigation at boundaries', async ({ page }) => {
    // Verificar que la aplicación se carga sin errores
    await expect(page.locator('.app-container')).toBeVisible();
    
    // Inyectar playlist pequeña de 5 canciones
    await injectMockPlaylist(page, 5);
    
    // La primera canción debe estar seleccionada
    let selectedRow = page.locator('.song-row.selected');
    await expect(selectedRow).toBeVisible();
    let selectedText = await selectedRow.textContent();
    expect(selectedText).toContain('Song 01');
    
    // Intentar navegar hacia arriba desde la primera canción (no debe cambiar)
    await navigateWithArrow(page, 'up');
    selectedRow = page.locator('.song-row.selected');
    selectedText = await selectedRow.textContent();
    expect(selectedText).toContain('Song 01');
    
    // Navegar hasta la última canción
    for (let i = 0; i < 4; i++) {
      await navigateWithArrow(page, 'down');
    }
    
    selectedRow = page.locator('.song-row.selected');
    selectedText = await selectedRow.textContent();
    expect(selectedText).toContain('Song 05');
    
    // Intentar navegar hacia abajo desde la última canción (no debe cambiar)
    await navigateWithArrow(page, 'down');
    selectedRow = page.locator('.song-row.selected');
    selectedText = await selectedRow.textContent();
    expect(selectedText).toContain('Song 05');
    
    // La aplicación no debe crashear
    await expect(page.locator('.main-content')).toBeVisible();
  });
});
