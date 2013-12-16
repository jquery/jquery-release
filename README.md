# jQuery Project Release Automation

This script automates releases for all jQuery projects. It is designed to create
consistency between projects and reduce the burden of maintaining individual
release scripts.

## Creating a Release

Creating a release is as simple as cloning this repository and telling the
script which project to use. In order to ensure a clean and proper release is
created, you should always start from a new clone of this repository.

```sh
git clone git@github.com:jquery/jquery-release.git
cd jquery-release
node jquery-release.js --remote=jquery/<project-name>
```

### Testing the Release Script

You can do a test run of the release script by using a different remote
repository. The script is smart enough to detect if you're using an
official repository and adjust which actions are taken so that undesired
actions, such as publishing to npm, don't occur for test runs.

### Full Usage Options

See the [usage documentation](/docs/usage.txt) for the full set of options.
You can also run the script with no parameters to see the usage.



## Creating a Project-Specific Release Script

This script only performs the set of common functionality across all projects.
Each project may have additional functionality. Any project-specific
configuration and functionality must be defined in the `build/release.js` file
inside the project's repository.

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

#### checkRepoState()

Performs any project-specific checks to ensure the repository is in a good state
to be released. For example, there is a built-in check to ensure that
AUTHORS.txt is up-to-date.

This method has no return value. If a project-specific check fails, the script
should use `Release.abort()` to prevent the release from continuing.

#### generateArtifacts( callback )

Generates any release artifacts that should be included in the release. The
callback must be invoked with an array of files that should be committed before
creating the tag.

#### changelogShell()

Defines the shell for the changelog. The changelog is created by concatenating
the shell, the commit log, and the issue list.

#### issueTracker

Which type of issue tracker is being used for the project. Must be either
`"trac"` or `"github"`.

#### contributorReportId

If using Trac, this defines which report will produce a list of contributors
for a specific release.

See [docs/trac-contributors.sql](docs/trac-contributors.sql) for the SQL
necessary to create the Trac report.

### Other Methods

#### define( props )

Defines new properties and methods to add to the `Release` object.

#### abort( msg )

Aborts the release and prints the message.

#### exec( command, options )

Executes the given `command`. You can pass `{ silent: true }` to suppress output
on the command line.

Returns the output.

#### git( command, errorMessage )

Executes the given git `command`. If the command fails, the release will be
aborted and `errorMessage` will be displayed.

#### gitLog( format )

Gets a git log using the specified format. If the log fails, the release will be
aborted.

Returns an array of commits.

#### prompt( callback )

Prompts the user for input.

Passes the input to `callback`.

#### confirm( callback )

Prompts the user to confirm they want to continue with the release script. If
the user decides not to continue, the release will be aborted and `callback`
won't be invoked.

#### confirmReview( callback )

Prompts the user to review the output and confirm they want to continue with the
release script. If the user decides not to continue, the release will be aborted
and `callback` won't be invoked.

#### trac( path )

Gets the results of a Trac query, with tab-delimited results.

Returns the tab-delimited string.

#### readPackage()

Gets the contents of `package.json` as an object.

#### writePackage( package )

Saves `package` to `package.json`, preserving indentation style.

### Other Properties

#### isTest

Whether this is a test release.

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

#### tagTime

Timestamp for the release tag.

#### branch

Which branch the release is being generated from.
