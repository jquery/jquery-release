# Changelog, please

Generate changelogs from git commit messages using node.js. The generated changelogs are written in markdown.

Support this project by [donating on Gittip](https://www.gittip.com/scottgonzalez/).

## Installation

```
npm install changelogplease
```

## Usage

```javascript
var changelog = require( "changelogplease" );
var parsed = changelog({
	ticketUrl: "https://github.com/scottgonzalez/changelogplease/issues/{id}",
	commitUrl: "https://github.com/scottgonzalez/changelogplease/commit/{id}",
	repo: "/path/to/repo",
	committish: "1.2.3..1.2.4"
});
```

## API

### changelog( options, callback )

* `options` (Object): Options for creating the changelog.
  * `ticketUrl` (String): Template for ticket/issue URLs; `{id}` will be replaced with the ticket id.
  * `commitUrl (String)`: Template for commit URLs; `{id}` will be replaced with the commit hash.
  * `repo` (String): Path to the repository.
  * `committish` (String): The range of commits for the changelog.
* `callback` (Function; `function( error, log )`): Function to invoke after generating the changelog.
  * `log` (String): Generated changelog, written in markdown.

### Changelog

`changelog( options, callback )` is a shorthand for the following:

```js
var Changelog = require( "changelogplease" ).Changelog;
var instance = new Changelog( options );
instance.parse( callback );
```

Changelog generation is tailored to a specific format based on the needs of the various jQuery
projects. However, the `Changelog` constructor and prototype are exposed to allow flexibility.
Be aware that these methods are not currently documented because they may change. Feel free to
submit [feature requests](https://github.com/scottgonzalez/changelogplease/issues/new) if you don't
feel comfortable hacking in your own changes (or even if you do).


## License

Copyright 2014 Scott González. Released under the terms of the MIT license.

---

Support this project by [donating on Gittip](https://www.gittip.com/scottgonzalez/).
