export class ToastHelper {
    static show(message, duration = 3000) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);

        // Forcer le reflow pour que l'animation fonctionne
        toast.offsetHeight;

        // Afficher
        toast.classList.add('show');

        // Supprimer après délai
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400); // Temps de la transition
        }, duration);
    }
}
