module.exports = {
	// https://eslint.org/docs/user-guide/configuring#specifying-environments
    "env": {
        "browser": true,
		"es6": true,
		"node": true,
		"jest/globals": true,
	},
	// https://eslint.org/docs/user-guide/configuring#extending-configuration-files
	// "extends": "eslint:recommended",
	"extends": [
		// "eslint:all",
		"@lexa79",
		// "plugin:react/recommended",
	],
	// https://eslint.org/docs/user-guide/configuring#specifying-globals
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
	},
	// https://eslint.org/docs/user-guide/configuring#specifying-parser-options
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
	},
	// https://eslint.org/docs/user-guide/configuring#configuring-plugins
    plugins: [
		// "react",
		"jest",
	],
	// https://eslint.org/docs/user-guide/configuring#configuring-rules
    rules: {
		// "jest/no-large-snapshots": [ "warn", { maxSize: 50 } ],
	},
	// https://github.com/yannickcr/eslint-plugin-react#configuration
	settings: {
		// react: {
		// 	version: "detect"
		// }
	}
};
