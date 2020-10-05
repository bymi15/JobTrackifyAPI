# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.2.2](https://github.com/bymi15/JobTrackifyAPI/compare/v0.2.1...v0.2.2) (2020-10-05)


### Features

* **commands:** add seed command ([1287d0a](https://github.com/bymi15/JobTrackifyAPI/commit/1287d0a30a25a082724e0a550e0fe1dfc99ec5a9))
* **company:** add company CRUD route ([dfd159b](https://github.com/bymi15/JobTrackifyAPI/commit/dfd159b6d31ddf2769e9775d965bbed39509d7b6))
* **Company:** add company entity ([02427e3](https://github.com/bymi15/JobTrackifyAPI/commit/02427e34b113218bafd546c0981e761ab898a8a7))
* **config:** add development and production db ([4847d5e](https://github.com/bymi15/JobTrackifyAPI/commit/4847d5e4dc42757209c5fa77e4f3b12373f8b9d3))
* **CRUD:** add error checking and validation in update ([4dd8952](https://github.com/bymi15/JobTrackifyAPI/commit/4dd8952153bc570799d74f26eb03d1cfacb575d0))
* **CRUD:** add generic CRUD super class ([c1f775d](https://github.com/bymi15/JobTrackifyAPI/commit/c1f775d3f13a96087f52ea3e87194b55ad1d92fd))
* **CRUD.spec.ts:** add CRUD integration test ([800acb8](https://github.com/bymi15/JobTrackifyAPI/commit/800acb820d0025e3864d84950e884a8f2dd8b1ae))
* **EntitySeed:** add generic entity seed ([51be5ba](https://github.com/bymi15/JobTrackifyAPI/commit/51be5babe6c0f6c5df0792df333648193aaf28f4))
* **express:** add static file serve ([e69e490](https://github.com/bymi15/JobTrackifyAPI/commit/e69e490eb6767232755645be5ec91a3dcfd6dcac))
* **factories:** add CompanyFactory ([8ba6334](https://github.com/bymi15/JobTrackifyAPI/commit/8ba6334308f5a88cdb92c135cdaaa222ef54c220))
* **Generator:** add command for code generator ([0714363](https://github.com/bymi15/JobTrackifyAPI/commit/07143636c7ccf95f48f5f305212c7ecf8c85fb87))
* **seeds:** add CompanySeed ([f3da1b5](https://github.com/bymi15/JobTrackifyAPI/commit/f3da1b59c07d0c9ea4ac86242038d447e84332b0))
* **services:** add company service ([aec672a](https://github.com/bymi15/JobTrackifyAPI/commit/aec672adca9fb64c2f010e82107bbd722349dcae))
* **test:** add companyService integration test ([a882d98](https://github.com/bymi15/JobTrackifyAPI/commit/a882d9837ad384e1e0fe2e94f3dd6f4783034912))
* **UserService:** add CRUD super class ([b5b744f](https://github.com/bymi15/JobTrackifyAPI/commit/b5b744f73fcce60e3bdff97eda16e292a378a4aa))


### Bug Fixes

* **commands:** fix seed command to use EntitySeed ([7e0212b](https://github.com/bymi15/JobTrackifyAPI/commit/7e0212b4e10070f3f9e22596199d08b6ae76e2cb))

### [0.2.1](https://github.com/bymi15/JobTrackifyAPI/compare/v0.2.0...v0.2.1) (2020-10-01)


### Features

* **express:** log error for debugging ([5b843cc](https://github.com/bymi15/JobTrackifyAPI/commit/5b843cccd8d9ed197162e5e38d8156d77b681b9f))
* **factories:** add userFactory function for saving test user data to db ([3b776f5](https://github.com/bymi15/JobTrackifyAPI/commit/3b776f53d9ecca79f2ad1c8e99633605814cabe2))
* **tests:** add jest unit testing ([b76633f](https://github.com/bymi15/JobTrackifyAPI/commit/b76633f06498c1f88378b4afb7383cc8d09c87aa))
* **tests:** add login, register unit tests for UserService ([4df9bc5](https://github.com/bymi15/JobTrackifyAPI/commit/4df9bc513ccab09aaae6eca7056258315611f5c7))
* **User:** add validation for firstName and lastName ([d004c0e](https://github.com/bymi15/JobTrackifyAPI/commit/d004c0e915e83ef60ff1a154fcb104b1372acfcf))

## 0.2.0 (2020-09-28)


### ⚠ BREAKING CHANGES

* refactor javascript to typescript and replace mongoose with typeorm

### Features

* add dependency injection orchestration ([afdbaeb](https://github.com/bymi15/JobTrackifyAPI/commit/afdbaeb66b1b789847dfa472955e1aa21ab29c76))
* refactor entire project in typescript ([6dea3de](https://github.com/bymi15/JobTrackifyAPI/commit/6dea3de6ac8a93f4aa80e5648354acc1b32eed0a))
* **.env.example:** add example .env file ([646836a](https://github.com/bymi15/JobTrackifyAPI/commit/646836a56e41849bfa485055c8baf9c3ec0e4f0a))
* **auth:** implement user authentication with JWT ([8af3311](https://github.com/bymi15/JobTrackifyAPI/commit/8af3311e255b53e424a9aefa521ccb7d3a8daa5c))
* **esm:** add esm and refactor require to es6 import ([b537399](https://github.com/bymi15/JobTrackifyAPI/commit/b53739982e08c9fc45730df903da6575b28b7a41))
* **loaders:** add loaderse for express, mongodb and logger ([b091e48](https://github.com/bymi15/JobTrackifyAPI/commit/b091e48486fe373f26d6307808d01beb403e5691))
* **middlewares:** add isAuth and attachCurrentUser middlewares ([8df766f](https://github.com/bymi15/JobTrackifyAPI/commit/8df766fbafbf8e60137ad0692493e02391287d70))
* **models:** add company model ([b49c6c5](https://github.com/bymi15/JobTrackifyAPI/commit/b49c6c5b85b32d22c0938f0bbfde39792a265514))
* **models:** add user model ([df113a2](https://github.com/bymi15/JobTrackifyAPI/commit/df113a2cbb19ed15642ef8b30c4c4a7841114ff3))
* **package.json:** add body-parser ([59afb2a](https://github.com/bymi15/JobTrackifyAPI/commit/59afb2a1325ea784fe62e5d1b0f3dc8614e2db4e))
* **package.json:** add dotenv ([a54f76c](https://github.com/bymi15/JobTrackifyAPI/commit/a54f76c48cda7fa0956aefe1093eb35d54a63d16))
* **package.json:** add TypeDI for dependency injection ([5291e9c](https://github.com/bymi15/JobTrackifyAPI/commit/5291e9ce54b9ef674e7f82604edaf4014a81be11))
* **package.json:** add winston ([163e338](https://github.com/bymi15/JobTrackifyAPI/commit/163e3383013a6d508b5ddb42cf33c7734a6ecdbe))
* **routes:** add auth route ([e1f5b6f](https://github.com/bymi15/JobTrackifyAPI/commit/e1f5b6f807e7da8ddcf81e0ea2d3b5a851ce0fc0))
* **routes:** add user route ([82da271](https://github.com/bymi15/JobTrackifyAPI/commit/82da2714868404073a8d3edb1a850df16fb38eb5))
* **server:** add express mongoose boilerplate ([204f056](https://github.com/bymi15/JobTrackifyAPI/commit/204f056df81108104f91db5b89fa5706e2ab85f9))
* **services:** add auth service ([aef2319](https://github.com/bymi15/JobTrackifyAPI/commit/aef231914ae815d7a8c9ac91c24284c2b487c720))
