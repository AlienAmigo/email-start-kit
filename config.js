/* global module */

// настройки проекта
let config = {

  // флаги, если нужно отключить какую-то часть сборки (например, в случае полной ненадобности js или сторонних модулей (Vendors))
  options: {
    copyAssets: false,
    processJs: true,
    copyJsVendors: true,
  },

  // переменные директорий проекта
  dir: {
    src: 'src/',
    build: 'build/',
    assets: 'build/assets/',
    blocks: 'src/blocks/'
  },

  // дополнительные файлы проекта
  addAssets: {
  },
};

module.exports = config;
