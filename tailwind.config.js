/** @type {import('tailwindcss').Config} */
module.exports = {
  // Ensure paths cover all files using Tailwind classes
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}", // Add if you have a components folder
    "./*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
