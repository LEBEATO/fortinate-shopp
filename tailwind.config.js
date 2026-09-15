/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                fortnite: {
                    yellow: '#f5e400',
                    purple: '#8b5cf6',
                    blue: '#31a8ff',
                    dark: '#070b17',
                    card: '#11192b'
                }
            }
        },
    },
    plugins: [],
    darkMode: 'class',
}
