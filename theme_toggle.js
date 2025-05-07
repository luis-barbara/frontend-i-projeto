// theme_toggle.js

class TemaToggle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
            <style>
                button {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: inherit;
                    padding: 8px;
                    border-radius: 6px;
                    transition: background-color 0.2s ease;
                }

                button:hover {
                    background-color: rgba(0, 0, 0, 0.05);
                    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
                }
            </style>
            <button id="toggleBtn" aria-label="Alternar tema">
                <i class="fa-solid fa-moon"></i>
            </button>
        `;
    }

    connectedCallback() {
        this.button = this.shadowRoot.querySelector('#toggleBtn');
        this.updateInitialTheme();
        this._toggleHandler = () => this.toggleTheme();
        this.button.addEventListener('click', this._toggleHandler);
    }    

    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.updateIcon(isDark ? 'sun' : 'moon');
    }

    updateInitialTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const isDark = savedTheme === 'dark';
        if (isDark) {
            document.body.classList.add('dark-mode');
        }
        this.updateIcon(isDark ? 'sun' : 'moon');
    }

    updateIcon(icon) {
        this.button.innerHTML = `<i class="fa-solid fa-${icon}"></i>`;
    }

    disconnectedCallback() {
        this.button.removeEventListener('click', this._toggleHandler);
    }
}

customElements.define('tema-toggle', TemaToggle);
