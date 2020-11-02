# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.4.0](https://github.com/bymi15/JobTrackifyAPI/compare/v0.3.1...v0.4.0) (2020-11-02)


### ⚠ BREAKING CHANGES

* **Company:** restructure Company entity and add more fields

### Features

* **Company:** restructure Company entity ([c2eb72c](https://github.com/bymi15/JobTrackifyAPI/commit/c2eb72c81bf898d143924d8d2233259bb0511821))

### [0.3.1](https://github.com/bymi15/JobTrackifyAPI/compare/v0.3.0...v0.3.1) (2020-10-30)


### Features

* **BoardColumn:** add BoardColumn entity schema ([5339959](https://github.com/bymi15/JobTrackifyAPI/commit/5339959ebda2105cbb3b8233ddebff2080e3b793))
* **BoardColumn:** add service, routes, factory for BoardColumn entity ([46780f6](https://github.com/bymi15/JobTrackifyAPI/commit/46780f656c74caab1f4a46a085f32c94ad2211c8))
* **CRUD:** add options to find ([7265172](https://github.com/bymi15/JobTrackifyAPI/commit/7265172cfc4b23156a37dbd787c63f095b0d50b6))
* **database:** add Job factory and seed ([bfce299](https://github.com/bymi15/JobTrackifyAPI/commit/bfce299a16cd43fc6a3d6e87a7745267cbb2f979))
* **entities:** add Job entity ([1ab48c3](https://github.com/bymi15/JobTrackifyAPI/commit/1ab48c3bc0aa0fd64f4dcb799406ec0457e148d3))
* **routes:** add jobs route ([532db07](https://github.com/bymi15/JobTrackifyAPI/commit/532db07126bb957262637a5e339a2fcfb1eb5f9c))
* **services:** add Job service ([adb8046](https://github.com/bymi15/JobTrackifyAPI/commit/adb8046827f79a0fed84c6a9640e887b059b92fe))


### Bug Fixes

* **BoardService:** add default ordering by most recent date created ([36b6461](https://github.com/bymi15/JobTrackifyAPI/commit/36b6461ff67c3b3bb138d118bba8cd0dc6e0a72a))
* **CompanyEntity:** set foundedYear as an optional field ([1cb50c3](https://github.com/bymi15/JobTrackifyAPI/commit/1cb50c362b0469423d93794f5bc550f9645dc438))
* **CompanyService:** add default alphabetical ordering by name ([75eab8d](https://github.com/bymi15/JobTrackifyAPI/commit/75eab8d387b379f1030797a8e1085e57d9174c35))
* **CRUD:** fix update function ([240de04](https://github.com/bymi15/JobTrackifyAPI/commit/240de04f1a913daa46827a2009dd9c0bf13b22ce))
* **entities:** add IsOptional class validator checks ([00bb063](https://github.com/bymi15/JobTrackifyAPI/commit/00bb0633ca46ae2572e7df7ba3665f9886d7fe08))
* **Job:** remove unnecessary index field from Job entity ([5c47d43](https://github.com/bymi15/JobTrackifyAPI/commit/5c47d432c83aa720ecac86aeede9b65a47ebd360))
* **JobEntity:** remove buggy index ([8fa5726](https://github.com/bymi15/JobTrackifyAPI/commit/8fa57268e36b2b0347431dc32619d9dcccbb4124))
* **JobFactory:** add missing parenthesis ([a7b045c](https://github.com/bymi15/JobTrackifyAPI/commit/a7b045c35d20a909a66d2aaec89d3eea43a677f4))
* **JobService:** fix alignSortOrder to align within the board and column ([e68cc87](https://github.com/bymi15/JobTrackifyAPI/commit/e68cc87065292f0bc7dd266bb348336ad2c7d21b))
* **jobsRoute:** add missing attachUser middleware ([10e5594](https://github.com/bymi15/JobTrackifyAPI/commit/10e5594d7cdcbd160e540559964e9d2bbc16d010))
* **jobsRoute:** add owner check ([b786318](https://github.com/bymi15/JobTrackifyAPI/commit/b7863189cfecd05a8c8e3808691c2397d718f848))
* **jobsRoute:** fix create job route ([4095552](https://github.com/bymi15/JobTrackifyAPI/commit/4095552c48e54b51f9423e8d3c610e0a0511d025))
* **routes:** update jobs route ([dd0542b](https://github.com/bymi15/JobTrackifyAPI/commit/dd0542bf50c313fd5f4e1c762621618956a6f48d))
* **seeds:** update seeds ([81428be](https://github.com/bymi15/JobTrackifyAPI/commit/81428be7e024364a5e8d91845af7c93f68cea175))
* **services:** bug fixes ([80d100d](https://github.com/bymi15/JobTrackifyAPI/commit/80d100da6097eb55c981eefa560be5c8f122f719))

## [0.3.0](https://github.com/bymi15/JobTrackifyAPI/compare/v0.2.2...v0.3.0) (2020-10-16)


### ⚠ BREAKING CHANGES

* **Board:** add Board entity, route, service and factory

### Features

* **app:** separate server.ts for e2e testing ([30dff46](https://github.com/bymi15/JobTrackifyAPI/commit/30dff462b7af552dbc2de0d0177a42a76c99c911))
* **Board:** add Board API ([91c811f](https://github.com/bymi15/JobTrackifyAPI/commit/91c811f85cd35b40f84ca9d47e445cac4efe4ab2))
* **BoardService:** add Board service ([27ce090](https://github.com/bymi15/JobTrackifyAPI/commit/27ce09051c9a8faaeb0e43de3b0b7f99d9035940))
* **companyRoute:** add checkRole to only allow staff users write access ([ccabbb6](https://github.com/bymi15/JobTrackifyAPI/commit/ccabbb641d396be7a6acee6ec8bb9ea746c5f123))
* **CRUD:** add fillObjectIdField function ([ca35e6b](https://github.com/bymi15/JobTrackifyAPI/commit/ca35e6be6710a0f86b78da98e4642709561292f7))
* **ErrorHandler:** use custom ErrorHandler for throwing errors with status codes ([425385c](https://github.com/bymi15/JobTrackifyAPI/commit/425385cc5ff7e1ee30127c63361d5f5978830a4d))
* **factories:** add Board factory ([0f3a48c](https://github.com/bymi15/JobTrackifyAPI/commit/0f3a48cc2437f0a7e8495a382111c823da0967ba))
* **helpers:** add ErrorHandler ([093f088](https://github.com/bymi15/JobTrackifyAPI/commit/093f0881a9394de4937da8ce4b2232a59d37dfce))
* **middlewares:** add checkRole middleware ([5d6df48](https://github.com/bymi15/JobTrackifyAPI/commit/5d6df48dea968c461534578151bdae276d4a1219))
* **routes:** add boards route ([e7a458a](https://github.com/bymi15/JobTrackifyAPI/commit/e7a458ae9f6637a99f8f707e95b47841a75f0ae1))
* **routes:** add user endpoints ([0598963](https://github.com/bymi15/JobTrackifyAPI/commit/059896315c90087ae20a70f10845873690c89885))
* **routes:** add user endpoints ([92a69a3](https://github.com/bymi15/JobTrackifyAPI/commit/92a69a323b55bd0902ada8034cfd171cffc510cc))
* **seeds:** add Board seed ([be6f124](https://github.com/bymi15/JobTrackifyAPI/commit/be6f1245af98d3027e3ce532f1892014c6ef56ff))
* **User:** add hasAccessTo function to check role ([663ff8e](https://github.com/bymi15/JobTrackifyAPI/commit/663ff8e95e4cce62affc9623ad9300851026555a))
* **UserService:** add find and findOne functions that remove password field ([72e9a1b](https://github.com/bymi15/JobTrackifyAPI/commit/72e9a1bcebb6762c75c95f6de98faadad7f1fe64))


### Bug Fixes

* **generateToken:** use async jwt sign ([e9bbab0](https://github.com/bymi15/JobTrackifyAPI/commit/e9bbab08e45aec5102befbea6af8f96974066a84))
* bug fixes ([3befcca](https://github.com/bymi15/JobTrackifyAPI/commit/3befccad31cba917d4d1966112e54b95747f0f20))
* **boardsRoute:** call status before json ([c796825](https://github.com/bymi15/JobTrackifyAPI/commit/c7968252150038478bd03557a20a8f723d4cb6ec))
* **companiesRoute:** set fields optional except name ([74021b8](https://github.com/bymi15/JobTrackifyAPI/commit/74021b8c9e6fd6dcd7c224b8882fd37ed825faad))
* **CRUD:** add error check for find and findOne ([fbe5488](https://github.com/bymi15/JobTrackifyAPI/commit/fbe5488aa90ecef9afb30a77b682a474aaabff53))
* **CRUD:** fix update findOne bug ([2d3322f](https://github.com/bymi15/JobTrackifyAPI/commit/2d3322fbfb3a4a06c723b7be0dc28377ecef0541))
* **CRUD:** fix update function ([32f55a8](https://github.com/bymi15/JobTrackifyAPI/commit/32f55a88a573e51749747f93c46a30df6283839c))
* **CRUD:** fix update validation check ([27f7246](https://github.com/bymi15/JobTrackifyAPI/commit/27f7246a3df5fc06c0f01f1f896959a5b7d31290))
* **entities:** fix company entity createdAt default value ([866f682](https://github.com/bymi15/JobTrackifyAPI/commit/866f68266d446d8eb5e1b8d075b0a99d2b838486))
* **expressLoader:** add celebrate validation error handler ([5a667b2](https://github.com/bymi15/JobTrackifyAPI/commit/5a667b2a725db77d0df20ff8d8685f4be8ac4e3b))
* **Generator:** refactor route json response format ([19820ff](https://github.com/bymi15/JobTrackifyAPI/commit/19820ffda43552fd40eda357fdfdc711a6b61f89))
* **package.json:** add --runInBand jest option for testing in series ([bc9521c](https://github.com/bymi15/JobTrackifyAPI/commit/bc9521cfb213353d38f4ddee7edd6e044c673679))
* **routes:** fix boards update route ([6fb5e45](https://github.com/bymi15/JobTrackifyAPI/commit/6fb5e453d9f1b9a19be294e9499a5d4c8cdc0edd))
* **services:** refactor id type to be strictly string ([c777e24](https://github.com/bymi15/JobTrackifyAPI/commit/c777e2499a53b276fea13e0c15b7e5fbacd30991))
* **UserService:** change 500 to 400 error code ([4f71416](https://github.com/bymi15/JobTrackifyAPI/commit/4f71416de346c0d2e754ac702d2c3669d32dc1c8))

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
