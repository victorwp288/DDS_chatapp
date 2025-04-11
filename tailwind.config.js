/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./*.{js,jsx,ts,tsx}"], // Added root directory scan
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
