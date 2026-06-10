export default {
  // Specifies the paths to all of your template files. 
  // Tailwind uses this to scan your code and find the class names you used,
  // ensuring only the CSS you actually need gets generated in production.
  content: [
    "./index.html",         // Scans the main HTML file in the root directory
    "./src/**/*.{js,jsx}"   // Scans all .js and .jsx files inside the src folder (and subfolders)
  ],

  theme: {
    // Allows you to customize Tailwind's default design tokens (colors, fonts, spacing, etc.).
    // Placing objects inside 'extend' adds new utilities without overwriting the defaults.
    extend: {},
  },

  // Used to register official or third-party plugins (like @tailwindcss/typography or @tailwindcss/forms)
  // to add extra pre-built functionality to your project.
  plugins: [],
}