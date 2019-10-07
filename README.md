# @lexa79/jest-matchers

This is a collection of some additional matchers I use for unit testing of React applicationer together with Jest.

To use them with an React app which I started with `create-react-app`, I add the following to `setupTests.js`:

``` js
// Add some useful matchers to Jest:
import MyMatchers from "@lexa79/jest-matchers";
expect.extend( MyMatchers );
```

PS: Most of the time I'm using `jest-spec-reporter` with `react-scripts test --reporters=jest-spec-reporter`

# Planned crashing

## Examples

``` js
describe( "Component Logo", () => {
	describe( "when rendering", () => {
		it( "with no properties - FAILS", () => {
			const div = document.createElement( "div" );
			expect( () => {
				ReactDOM.render( <Logo />, div );
			} ).toSucceedWithMessages();
			ReactDOM.unmountComponentAtNode( div );
		} );

		it( "with minimal properties - succeeds", () => {
			const div = document.createElement( "div" );
			expect( () => {
				ReactDOM.render( <Logo text="" />, div );
			} ).toSucceedWithoutMessages();
			ReactDOM.unmountComponentAtNode( div );
		} );
	} );
} );
```

## `toThrowWithSuppressedOutput()`

``` js
expect( callback ).toThrowWithSuppressedOutput();
```

* **Test:**
  Ensures that the given callback crashs.
  Any output produced with console.error() is suppressed.

* **Negation behaves like a "toSucceedWithSuppressedOutput":**
  Ensures that the given callback doesn't crash.
  Any output produced with console.error() is suppressed.

* **Parameter `callback`:**
  Callback function which shall be checked

## `toSucceedWithMessages()`

``` js
expect( callback ).toSucceedWithMessages();
```

* **Test:**
  Ensures that the given callback doesn't crash
  and that in the same time some output is produced with console.error().

* **Negation:**
  Ensures that the callback crashs or
  at least doesn't generate any output with console.error().

* **Parameter `callback`:**
  Callback function which shall be checked

## `toSucceedWithoutMessages()`

``` js
expect( callback ).toSucceedWithoutMessages();
```

* **Test:** 
  Ensures that the given callback doesn't crash
  and doesn't produce any output with console.error().

* **Negation:**
  Ensures that the callback crashs or
  at least produces some output with console.error().

* **Parameter `callback`:**
  Callback function which shall be checked

# Enhanced snapshots

## Example

``` js
import { shallow } from "enzyme";

describe( "Component Logo", () => {
	describe( "when rendering", () => {
		it( "with minimal properties - delivers expected result  (-> check snapshot, too)", () => {
			// eslint-disable-next-line quotes
			const testString = `<Logo text="" />`;
			const testElement = <Logo text="" />;
			const wrapper = shallow( testElement );

			const html = `${wrapper.html()}<br/><br/>${testString.replace( "<", "&lt;" ).replace( ">", "&gt;" )}`;

			return expect( html ).toAsyncMatchNamedHTMLSnapshot( "Logo" );
		} );
	} );
} );
```

`__snapshots__/Logo.html`:

``` html
<!DOCTYPE html>
<html style="height: 100%;">
  <head></head>
  <body style="display: flex; flex-flow: column nowrap; justify-content: center; align-items: center; height: 100%;">
    <h2>Component Logo when rendering with minimal properties - delivers expected result (-> check snapshot, too)</h2>
    <!-- Content from unit test: -->
    <div class="empty-svg"></div>
    <br /><br />&lt;Logo text="" /&gt;
    <!-- End of included content -->
  </body>
</html>
```

## `toAsyncMatchNamedSnapshot()` (asynchron)

``` js
return expect( content ).toAsyncMatchNamedSnapshot( filename );
```

* **Important:**
  This test works asynchronously. Remember to always return its result in the test!

* **Test:**
  Reads the given file and ensures that its content matches the given string (if file exists); or
  Writes the given string into a new file with the given name (if file doesn't exist)

* **Negation:**
  Ensures that the given file exists and that its content DOESN'T match the given string

* **Parameter `content`**:
  Expected content of the snapshot-file

* **Parameter `filename`**:
  Name of the snapshot-file, e.g. "Logo", "Logo.snap" or "/home/user/project/Logo.snap"

## `toAsyncMatchNamedHTMLSnapshot()` (asynchron)

``` js
return expect( content ).toAsyncMatchNamedHTMLSnapshot( filename );
```

* **Important:**
  This test works asynchronously. Remember to always return its result in the test!

* **Test:**
  Reads the given HTML file and ensures that its body matches the given string (if file exists); or
  Writes the given string as a complete HTML document into a new file with the given name (if file doesn't exist)

* **Negation:**
  Ensures that the given HTML file exists and that its body DOESN'T match the given string

* **Parameter `content`**:
  Expected body of the HTML-file

* **Parameter `filename`**:
  Name of the snapshot-file, e.g. "Logo", "Logo.html" or "/home/user/project/Logo.html"
