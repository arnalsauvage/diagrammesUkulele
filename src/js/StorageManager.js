import { STORAGE_KEYS } from './config.js';

export class StorageManager {
    // --- FAVORIS ---
    static getFavorites() {
        const json = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        return json ? JSON.parse(json) : [];
    }

    static saveFavorites(favs) {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    }

    static isFavorite(pos) {
        if (!pos) return false;
        return StorageManager.getFavorites().includes(pos);
    }

    static addFavorite(pos) {
        if (!pos) return;
        const favs = StorageManager.getFavorites();
        if (!favs.includes(pos)) {
            favs.push(pos);
            StorageManager.saveFavorites(favs);
            return true;
        }
        return false;
    }

    static removeFavorite(pos) {
        if (!pos) return;
        const favs = StorageManager.getFavorites().filter(f => f !== pos);
        StorageManager.saveFavorites(favs);
    }

    // --- PALETTES ---
    static getPalettes() {
        const json = localStorage.getItem(STORAGE_KEYS.PALETTES);
        return json ? JSON.parse(json) : [];
    }

    static savePalettes(palettes) {
        localStorage.setItem(STORAGE_KEYS.PALETTES, JSON.stringify(palettes));
    }

    static addPalette(palette) {
        const palettes = StorageManager.getPalettes();
        if (palettes.length < 3) {
            palettes.push(palette);
            StorageManager.savePalettes(palettes);
            return true;
        }
        return false;
    }

    static removePalette(index) {
        const palettes = StorageManager.getPalettes().filter((_, i) => i !== index);
        StorageManager.savePalettes(palettes);
    }
}
