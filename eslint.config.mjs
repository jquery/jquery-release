import jqueryConfig from "eslint-config-jquery";
import globals from "globals";

export default [
	{

		// Only global ignores will bypass the parser
		// and avoid JS parsing errors
		// See https://github.com/eslint/eslint/discussions/17412
		ignores: [
			"__release/**"
		]
	},

	jqueryConfig,

	{
		languageOptions: {
			ecmaVersion: 2025,
			sourceType: "script",
			globals: {
				...globals.node
			}
		},
		rules: {
			strict: [ "error", "global" ]
		}
	},

	{
		files: [ "*.mjs" ],
		languageOptions: {
			sourceType: "module"
		}
	}
];
