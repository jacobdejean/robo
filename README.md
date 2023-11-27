# robo

A web crawling robot. This project is in a very early stage. Eventually, I intend to transform this into a system that lets you create multiple robots each with its own goal and process. They could travel together, or as a group. There is no clean or practical code pattern implemented yet.

Currently this is just a personal proof of concept that navigates to a starting url, then recursively screenshots every link on that page up to a maximum depth. It also utilizes a local sqlite database for storing the captures. Once this api is abstracted into a library, this screenshotting functionality will be moved to its own 'robo'.

## Usage

Robo is built on a Playwright test, so it has a great api for interacting with webpages and runs on real browser instances. At the moment the tests run on WebKit, but Playwright can easily be configured to use Chrome or Firefox instead.

```bash
bunx playwright test
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
