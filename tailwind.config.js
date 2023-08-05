/** @type {import('tailwindcss').Config} */

const konstaConfig = require('konsta/config');

module.exports = konstaConfig({
  
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],

  konsta: {
    colors: {
      
      // "primary" is the main app color, if not specified will be default to '#007aff'
      primary: '#3bedb2',
      //bg: '#007aff',

      'botfi-primary': '#51e8c4',
      // custom colors used for Konsta UI components theming
      'secondary': '#FAB612',
      
    }
  },

  darkMode: 'class',
  theme: {
    extend: {},
  },
  
  plugins: [],

});

