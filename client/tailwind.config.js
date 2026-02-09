/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#3b82f6', // Example blue
                secondary: '#1e293b', // Example dark
                accent: '#f59e0b', // Example amber
            },
        },
    },
    plugins: [],
}
