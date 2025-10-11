module.exports = {
  root: true,
  env: { es2023: true, node: true, browser: false },
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended", "prettier"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
  settings: { react: { version: "detect" } },
  plugins: ["react", "react-hooks"],
  overrides: [
    { files: ["frontend/src/**/*.{js,jsx}"], env: { browser: true, node: false } },
    { files: ["backend/**/*.js"], env: { node: true, browser: false } },
  ],
  rules: {
    "react/prop-types": "off"
  },
};
