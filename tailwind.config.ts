import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#f0e3d7', // لون الخلفية
                foreground: '#2d2d2d', // لون النص
                primary: {
                    DEFAULT: '#8f5e36', // اللون الأساسي
                },
                secondary: {
                    DEFAULT: '#6d412a', // اللون الثانوي
                },
                accent: {
                    DEFAULT: '#fffaeb', // لون إضافي
                },
                muted: {
                    DEFAULT: '#c2b19c', // لون ممل
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                // يمكنك إضافة المزيد من الألوان حسب الحاجة
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
        },
    },
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    plugins: [require('daisyui'), require("tailwindcss-animate")],
};

export default config;
