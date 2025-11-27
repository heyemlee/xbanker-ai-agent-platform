/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Stripe-inspired palette
                brand: {
                    DEFAULT: '#635bff', // Blurple
                    dark: '#4b45c6',
                    light: '#8075ff',
                    subtle: '#e3e1fc',
                },
                slate: {
                    50: '#f7f9fc', // Main background
                    100: '#e3e8ee', // Borders
                    200: '#c1c9d2',
                    300: '#a3acb9',
                    400: '#8792a2',
                    500: '#697386', // Secondary text
                    600: '#4f566b',
                    700: '#3c4257', // Primary text
                    800: '#2a2f45',
                    900: '#1a1f36', // Headings
                },
                success: {
                    DEFAULT: '#0570de', // Using a blue-ish success or standard green? Stripe uses green for success.
                    text: '#007f5f',
                    bg: '#e6f8f3',
                },
                warning: {
                    text: '#9e6c00',
                    bg: '#fff8e6',
                },
                danger: {
                    text: '#c01048',
                    bg: '#fff1f3',
                },
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            boxShadow: {
                'subtle': '0 2px 5px -1px rgba(50, 50, 93, 0.25), 0 1px 3px -1px rgba(0, 0, 0, 0.3)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'float': '0 13px 27px -5px rgba(50, 50, 93, 0.25), 0 8px 16px -8px rgba(0, 0, 0, 0.3)',
            }
        },
    },
    plugins: [],
}
