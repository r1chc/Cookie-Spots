module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: 'var(--primary-color)',
            600: 'var(--primary-color)',
            700: '#7c4dd0',
          },
          // other color extensions
        },
      },
    },
    plugins: [],
  }  