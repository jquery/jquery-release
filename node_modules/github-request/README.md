# GitHub Request

Simplified GitHub API requests.

Support this project by [donating on Gratipay](https://gratipay.com/scottgonzalez/).

## About

Low level helper for working with the GitHub API.

## Installation

```sh
npm install github-request
```

## Usage

```js
var github = require("github-request");
github.request({
	path: "/orgs/jquery/repos"
}, function(error, repos) {
	console.log(repos);
});
```

## API

### request(settings, data, callback)

Performs a single request based on the provided settings.

* `settings` (Object): Settings for the HTTPS request.
* `data` (Mixed): Data to pass for POST requests. Data is encoded as JSON prior to making the request.
* `callback` (`function( error, response, meta )`): A callback to invoke when the API call is complete.
  * `response` (Object): The parsed JSON response.
  * `meta` (Object): Metadata from the response headers.

### requestAll(settings, callback)

Performs a request based on the provided settings and then requests any additional paged content based on the response. Data from all pages are concatenated together and buffered until the last page of data has been retrieved.

* `settings` (Object): Settings for the HTTPS request.
* `callback` (`function( error, response, meta )`): A callback to invoke when all API calls are complete.
  * `response` (Object): The parsed JSON response.
  * `meta` (Object): Metadata from the headers of the *last* response.

### Response Metadata

The metadata provided contains information from the following headers:

* `x-ratelimit-*`
* `x-github-*`
* `link`

These headers are parsed into a more friendly format before being passed as the `meta` parameter in the `callback`.

All `x-*` headers have the `x-` prefix removed and the names are changed from dashed form to camel case. For example, `x-ratelimit-remaining` becomes `ratelimitRemaining`.

The `link` header is parsed into the named `rel` values. For example, `<https://api.github.com/resource?page=2>; rel="next"` becomes `{next: "https://api.github.com/resource?page=2"}` and is provided in the `links` property.

## License

Copyright Scott González. Released under the terms of the MIT license.

---

Support this project by [donating on Gratipay](https://gratipay.com/scottgonzalez/).
