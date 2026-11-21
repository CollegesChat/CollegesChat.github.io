module.exports = {
  plugins: [
    require("postcss-nesting")({ edition: "2024-02" }),
    require("@csstools/postcss-color-mix-function")(),
    require("autoprefixer")({
      overrideBrowserslist: ["chrome >= 105", "firefox >= 121", "safari >= 15.4"],
    }),
  ],
};
