/**
 * Copyright (c) 2019 <alexander.urban@cygni.se>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const fs = require( "fs" );
const path = require( "path" );

const toDiffableHtml = require( "diffable-html" );

/**
 * Ensures that the given callback crashs.
 * Any output produced with console.error() is suppressed.
 *
 * Negation behaves like a "toSucceedWithSuppressedOutput":
 * Ensures that the given callback doesn't crash.
 * Any output produced with console.error() is suppressed.
 *
 * @param	{function} 	callback
 *		Callback function which shall be checked
 *
 * @returns	{object}
 *		Description of the test result in the form { message: ..., pass: ... }
 */
function toThrowWithSupressedOutput( callback ) {
	let hasThrown = false;

	/* eslint-disable no-console */
	const originalConsole = console.error;
	console.error = jest.fn();

	try {
		callback.call();
	} catch ( error ) {
		hasThrown = true;
	}

	console.error = originalConsole;
	/* eslint-enable no-console */

	return {
		message: () => `expected callback "${callback.toString()}" to ${hasThrown ? "succeed" : "fail"}`,
		pass:    hasThrown,
	};
}

/**
 * Ensures that the given callback doesn't crash
 * and that in the same time some output is produced with console.error().
 *
 * Negation:
 * Ensures that the callback crashs or
 * at least doesn't generate any output with console.error().
 *
 * @param	{function}	callback
 *		Callback function which shall be checked
 *
 * @returns	{object}
 *		Description of the test result in the form { message: ..., pass: ... }
 */
function toSucceedWithMessages( callback ) {
	let hasThrown = false;
	const output = [];

	/* eslint-disable no-console */
	const originalConsole = console.error;
	console.error = jest.fn( msg => {
		output.push( msg );
	} );

	try {
		callback.call();
	} catch ( error ) {
		hasThrown = true;
	}

	console.error = originalConsole;
	/* eslint-enable no-console */

	const pass = !hasThrown && output.length > 0;

	return {
		message: () => {
			if ( pass ) {
				return `Expected callback "${callback.toString()}" to fail or at least not produce any output`;
			}
			if ( hasThrown ) {
				return `Expected callback "${callback.toString()}" to succeed, `
				+ `but it failed with those errors:\n${output.join( "\n" )}\n`;
			}
			return `Expected callback "${callback.toString()}" to produce some output`;
		},
		pass,
	};
}

/**
 * Ensures that the given callback doesn't crash
 * and doesn't produce any output with console.error().
 *
 * Negation:
 * Ensures that the callback crashs or
 * at least produces some output with console.error().
 *
 * @param	{function}	callback
 *		Callback function which shall be checked
 *
 * @returns	{object}
 *		Description of the test result in the form { message: ..., pass: ... }
 */
function toSucceedWithoutMessages( callback ) {
	let hasThrown = false;
	const output = [];

	/* eslint-disable no-console */
	const originalConsole = console.error;
	console.error = jest.fn( msg => {
		output.push( msg );
	} );

	try {
		callback.call();
	} catch ( error ) {
		hasThrown = true;
	}

	console.error = originalConsole;
	/* eslint-enable no-console */

	const pass = !hasThrown && output.length === 0;

	return {
		message: () => {
			if ( pass ) {
				return `Expected callback "${callback.toString()}" to fail or at least produce some output`;
			}

			return hasThrown
				? `Expected callback "${callback.toString()}" to succeed, `
				+ `but it failed with those errors:\n${output.join( "\n" )}\n`
				: `Expected callback "${callback.toString()}" to not produce any output`;
		},
		pass,
	};
}

/**
 * Helper function which wraps some additional text around the given content
 * depending on the given template.
 *
 * @param	{string}	content
 *		Rendered content, e.g. in HTML format
 * @param	{null|string}	template
 *		Type of embedding, e.g. "html"; or
 *		Null if the content shall be returned without changes.
 *
 * @returns	{string}
 *		Updated content
 *
 * @this
 */
function applyTemplate( content, template ) {
	if ( template === "html" ) {
		return toDiffableHtml( "<!DOCTYPE html>\n"
			+ "<html style=\"height: 100%;\"><head></head>"
			+ "<body style=\"display: flex; flex-flow: column nowrap; "
			+ "justify-content: center; align-items: center; height: 100%;\">"
			+ `<h2>${this.currentTestName}</h2>\n`
			+ "<!-- Content from unit test: -->\n"
			+ `${content}\n`
			+ "<!-- End of included content -->\n"
			+ "</body></html>" );
	}

	return content;
}

/**
 * Uses "jest-matchers-utils" to compose a diff of the two given strings.
 *
 * The improve readability, the result may only contain an extract of the actual content.
 *
 * @param	{string}	oldContent
 *		Old version of the text
 * @param	{string}	newContent
 *		New version of the text
 *
 * @returns	{string}
 *		Description of (some) differences between the two string, e.g.
 *			- New content
 *			+ Old content
 *
 *			- ...0/svg" width="95" height="95" style="background-color:yellow">
 *			+ ...0/svg" width="125" height="125" style="background-color:yellow">
 *
 * @this
 */
function diffStrings( oldContent, newContent ) {
	const { utils } = this;

	let diffStart = null;
	let oldDiff = null;
	let newDiff = null;
	do {
		diffStart = diffStart === null ? 0 : diffStart + 50;
		oldDiff = ( diffStart > 0 ? "..." : "" )
			+ oldContent.substr( diffStart, 250 )
			+ ( oldContent.length > diffStart + 250 ? "..." : "" );
		newDiff = ( diffStart > 0 ? "..." : "" )
			+ newContent.substr( diffStart, 250 )
			+ ( newContent.length > diffStart + 250 ? "..." : "" );
	} while (
		oldDiff.substr( 0, 50 ) === newDiff.substr( 0, 50 )
		&& diffStart + 50 < oldContent.length
		&& diffStart + 50 < newContent.length
	);

	return utils.printDiffOrStringify( newDiff, oldDiff, "New content", "Old content", true );
}

/**
 * Reads the given file and ensures that its content matches the given string (if file exists); or
 * Writes the given string into a new file with the given name (if file doesn't exist)
 *
 * Important:
 * This test works asynchronously. Remember to always return its result in the test, i.e.
 *		"return expect( content ).toMatchNamedSnapshot( filename );"
 *
 * Negation:
 * Ensures that the given file exists and that its content DOESN'T match the given string
 *
 * @param	{string}	content
 *		Expected content of the snapshot-file
 * @param	{string}	filename
 *		Path and name of the snapshot-file
 * @param	{null|string}	template
 *		Null if new content shall not be preprocessed; or
 *		"html" if new content shall be wrapped into the body of a new HTML document.
 *
 * @returns	{Promise<object>}
 *		Resolves with a description of the test result in the form { message: ..., pass: ... }
 *
 * @this
 */
function toAsyncMatchNamedSnapshot( content, filename, template = null ) {	// eslint-disable-line max-lines-per-function
	return new Promise( resolve => {	// eslint-disable-line max-lines-per-function
		const { snapshotState, testPath } = this;
		let resolved = false;
		let fileExisted = true;

		// @TODO Find a better way to determine the current update-mode!
		// (Current disadvantages: Accessing private property, interactive updates with key "u" don't work.)
		const doUpdateAll = snapshotState._updateSnapshot === "all";	// eslint-disable-line no-underscore-dangle

		const basename = path.basename( filename )
			+ ( path.extname( filename ) === "" ? `.${template || "snap"}` : "" );
		const dirname = path.basename( filename ) === filename ? path.dirname( testPath ) : path.dirname( filename );
		const subdirname = path.join( dirname, "__snapshots__" );
		const fullFilename = path.join( subdirname, basename );

		/**
		 * Helper: Resolve with information about failed test, but does nothing if called again
		 * @param	{Error|string}	error	Description of problem, e.g. "Can't find directory"
		 */
		const resolveError = error => {
			if ( !resolved ) {
				resolve( {
					pass:    false,
					message: () => error.message || error,
				} );
				resolved = true;
			}
		};

		let fullContent = content;
		try {
			fullContent = applyTemplate.call( this, content, template );
		} catch ( error ) {
			resolveError( error );
			return;
		}

		fs.promises.stat( dirname ).catch( error => {
			resolveError( error.code === "ENOENT"
				? `FATAL: Can't find directory - check the path of your snapshot-file (${dirname})`
				: `FATAL: ${error.message}` );
		} )
			.then( () => ( resolved
				? null
				: fs.promises.mkdir( subdirname ).catch( error => {
					if ( error.code !== "EEXIST" ) {
						resolveError( `FATAL: ${error.code} Failed to prepared snapshot dir (${subdirname})` );
					}
				} )
			) )
			.then( () => ( resolved || doUpdateAll
				? null
				: fs.promises.readFile( fullFilename, "utf8" ).catch( error => {
					if ( error.code === "ENOENT" ) {
						fileExisted = false;
					} else {
						resolveError( error );
					}
				} )
			) )
			.then( data => ( resolved || ( fileExisted && !doUpdateAll )
				? data
				: fs.promises.writeFile( fullFilename, fullContent )
					.then( () => fs.promises.readFile( fullFilename, "utf8" ) )
			) )
			.then( data => {
				if ( resolved ) {
					return;
				}

				if ( data !== null && data === fullContent ) {
					resolve( {
						pass:    true,
						message: () => ( fileExisted
							? `ERROR: Old content of file "${basename}" was expected to differ from new content`
							: `ERROR: File "${basename}" was expected to already exist with some different content` ),
					} );
				} else {
					const diff = diffStrings.call( this, data, fullContent );
					resolve( {
						pass:    false,
						message: () => `ERROR: Old content of file "${basename}" `
								+ `was expected to equal the new content:\n${diff}`,
					} );
				}
			} )
			.catch( resolveError );
	} );
}

module.exports = {
	// eslint-disable-next-line require-jsdoc
	toThrowWithSupressedOutput( callback ) {
		return toThrowWithSupressedOutput.call( this, callback );
	},
	// eslint-disable-next-line require-jsdoc
	toSucceedWithMessages( callback ) {
		return toSucceedWithMessages.call( this, callback );
	},
	// eslint-disable-next-line require-jsdoc
	toSucceedWithoutMessages( callback ) {
		return toSucceedWithoutMessages.call( this, callback );
	},
	// eslint-disable-next-line require-jsdoc
	toAsyncMatchNamedSnapshot( content, filename ) {
		return toAsyncMatchNamedSnapshot.call( this, content, filename );
	},
	// eslint-disable-next-line require-jsdoc
	toAsyncMatchNamedHTMLSnapshot( content, filename ) {
		return toAsyncMatchNamedSnapshot.call( this, content, filename, "html" );
	},
};
