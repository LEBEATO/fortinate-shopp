/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}", // Procura por arquivos na pasta raiz
    ],
    theme: {
        extend: {
            colors: {
                fortnite: {
                    yellow: '#ffe600',
                    purple: '#b150ff',
                    blue: '#2b99ff',
                    dark: '#111827',
                    card: '#1f2937'
                }
            }
        },
    },
    plugins: [],
    darkMode: 'class',
}