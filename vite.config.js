/**
 * Copyright 2021 Bonitasoft S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import resolve from '@rollup/plugin-node-resolve';

/**
 * @type {import('vite').UserConfig}
 */
const config = {
  // to access to the pages, put dev/public in the url
  // the following configuration let access pages via / but don't start the HMR to work as the resources are considered as static/unchanged
  //publicDir: 'dev/public',

  // ...
  server: {
    port: 10001,
  },

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'dev/public/index.html'),
        // nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
};

export default config;
