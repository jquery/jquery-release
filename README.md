# jQuery Project Release Automation

This script automates releases for all jQuery projects. It is designed to create consistency between projects and reduce the burden of maintaining individual release scripts.

## Creating a Release

Creating a release is as simple as cloning this repository and telling the script which project to use. In order to ensure a clean and proper release is created, you should always start from a new clone of this repository.

```sh
git clone git@github.com:jquery/jquery-release.git
cd jquery-release
node release.js --remote=jquery/<project-name>
```

### Testing the Release Script

***This only applies to those with access to some private repos. You can also use any other repo with a release script.***

You can do a test run of the release script by using a different remote repository. **It is recommended to perform tests from a fresh clone of the project being released.** The script is smart enough to detect if you're using an official repository and adjust which actions are taken so that undesired actions, such as publishing to npm, don't occur for test runs.

You can also explicitly specify `--dry-run` to skip actions that affect external state.

When working on features of this script, adapt the following to simplify testing a bit, replacing the paths for `project` and `cdn`:

```bash
#!/bin/sh -e
# uncomment next line to debug this script
# set -x
project=/path/to/fake-project
cdn=/path/to/fake-cdn

cd $project
git checkout master
set +e
git tag -d 0.0.1
set -e
git reset --hard safe
git checkout asdf
cd -

cd $cdn
git push -f
cd -

npm run clean
node --dry-run release.js --remote=$project
```

You need local clones of [fake-project](https://github.com/jquery/fake-project) and [fake-cdn](https://github.com/jquery/fake-cdn) (private, see note above), then update both variables to point to those.

Save as `test-release.sh` in the checkout of this repo, make  it executable with `chmod +x test-release.sh`, then run with `./test-release.sh`.

### Full Usage Options

See the [usage documentation](/docs/usage.txt) for the full set of options. You can also run the script with no parameters to see the usage.



## Creating a Project-Specific Release Script

This script only performs the set of common functionality across all projects. Each project may have additional functionality. Any project-specific configuration and functionality must be defined in the `build/release.js` file inside the project's repository.

Here's a minimal example:

```js
module.exports = function( Release ) {

Release.define({
	issueTracker: "trac",
	contributorReportId: 37,
	changelogShell: function() {
		return "# Amazing Changelog for v" + Release.newVersion + "\n";
	}
});

};
```

### Required/Recommended Configuration

#### checkRepoState( [ callback ] )

Performs any project-specific checks to ensure the repository is in a good state to be released. For example, there is a built-in check to ensure that `AUTHORS.txt` is up-to-date.

This method has no return value. If a project-specific check fails, the script should use `Release.abort()` to prevent the release from continuing.

This method may be synchronous or asynchronous depending on the presence of `callback`. If present, the callback must be invoked.

#### generateArtifacts( callback )

Generates any release artifacts that should be included in the release. The callback must be invoked with an array of files that should be committed before creating the tag.

#### changelogShell()

Defines the shell for the changelog. The changelog is created by concatenating the shell, the commit log, and the issue list.

#### tracMilestone()

If using Trac, return a different milestone to be used in the queries to generate a changelog and list of contributors. Defaults to `newVersion`.

#### npmTags()

A function that returns an array of tags to apply to the npm release. Every release must contain at least one tag.

#### issueTracker

Which type of issue tracker is being used for the project. Must be either `"trac"` or `"github"`.

#### contributorReportId

If using Trac, this defines which report will produce a list of contributors for a specific release.

See [docs/trac-contributors.sql](docs/trac-contributors.sql) for the SQL necessary to create the Trac report.

#### exports.dependencies

*Note: This is a property on the `exports` object in `build/release.js`.*

An array of release-specific dependencies. Dependencies can be listed here instead of in `devDependencies` in `package.json` so that contributors don't need to install dependencies which are only necessary for the release.

### Other Methods

#### define( props )

Defines new properties and methods to add to the `Release` object.

#### abort( msg [, error ] )

Aborts the release and prints the message. If an error object is provided, it is used for the stack trace, otherwise the current call stack is used.

#### exec( command, options )

Executes the given `command`. You can pass `{ silent: true }` to suppress output on the command line.

Returns the output.

#### git( command, errorMessage )

Executes the given git `command`. If the command fails, the release will be aborted and `errorMessage` will be displayed.

#### gitLog( format )

Gets a git log using the specified format. If the log fails, the release will be aborted.

Returns an array of commits.

#### prompt( callback )

Prompts the user for input.

Passes the input to `callback`.

#### confirm( callback )

Prompts the user to confirm they want to continue with the release script. If the user decides not to continue, the release will be aborted and `callback` won't be invoked.

#### confirmReview( callback )

Prompts the user to review the output and confirm they want to continue with the release script. If the user decides not to continue, the release will be aborted and `callback` won't be invoked.

#### trac( path )

Gets the results of a Trac query, with tab-delimited results.

Returns the tab-delimited string.

#### readPackage()

Gets the contents of `package.json` as an object.

#### writePackage( package )

Saves `package` to `package.json`, preserving indentation style.

#### walk( methods, done )

Executes the array of `methods` (minimum one element) step by step. For any given method, if that method accepts arguments (`method.length > 0`), it will pass a callback that the method needs to execute when done, making the method call async. Otherwise the method is assumed to be sync and the next method runs immediately.

Once all methods are executed, the `done` callback is executed.

#### dist( callback )

This function is available in case the project requires more distribution than what is provided.
It is called after building, but before publishing to npm.

### Other Properties

#### isTest

Whether this is a test release. Test releases don't publish to npm and use the fake-cdn project instead of publishing to the real CDN.

#### project

The name of the project being released.

#### remote

The location of the remote repository.

#### preRelease

The version number for a pre-release version, or `false` for stable releases.

#### dir.base

The main directory used for the release script.

#### dir.repo

The directory for the local repository.

#### newVersion

The version being released.

#### prevVersion

The previous release version (used for determining what changed).

#### nextVersion

The version that will be set in `package.json` after the release.

#### cdnPublish

Which directory contains files to publish to the jQuery CDN. Set to `false` to prevent publishing to the jQuery CDN. Defaults to `"dist/cdn"`.

#### npmPublish

Set to `true` to publish a release via npm. Defaults to `false`.

#### tagTime

Timestamp for the release tag.

#### branch

Which branch the release is being generated from.
