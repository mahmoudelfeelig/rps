module.exports = {
  root: true,
  env: { es2023: true, node: true, browser: false },
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended", "prettier"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
  settings: { react: { version: "detect" } },
  plugins: ["react", "react-hooks"],
  overrides: [
    {
      files: ["frontend/src/**/*.{js,jsx}"],
      env: { browser: true, node: false, jest: true },
    },
    { files: ["backend/**/*.js"], env: { node: true, browser: false } },
  ],
  rules: {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/no-unescaped-entities": "off",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "no-empty": ["warn", { "allowEmptyCatch": true }],
    "no-constant-condition": "warn",
    "react-hooks/exhaustive-deps": "warn"
  },
};
