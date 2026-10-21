/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f5f0e8',
                    100: '#ede5d4',
                    200: '#d9c9ab',
                    300: '#c4a97e',
                    400: '#a87c55',
                    500: '#4a5240',
                    600: '#3d4435',
                    700: '#30362a',
                    800: '#232820',
                    900: '#161a14',
                },
                accent: {
                    50: '#fdf3ed',
                    100: '#fae0cc',
                    200: '#f4be9a',
                    300: '#ed9668',
                    400: '#e3703c',
                    500: '#c4622d',
                    600: '#a5501f',
                    700: '#844016',
                    800: '#63300f',
                    900: '#432009',
                },
                cream: '#F5F0E8',
            },
            fontFamily: {
                sans: ['DM Sans', 'sans-serif'],
            },
            borderRadius: {
                'sm': '8px',
                'md': '12px',
                'lg': '20px',
            }
        },
    },
    plugins: [],
}