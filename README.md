# @lexa79/jest-matchers

This is a collection of some additional matchers I use for unit testing of React applicationer together with Jest.

To use them with an React app which I started with `create-react-app`, I add the following to `setupTests.js`:

``` js
import ReactDOMServer from "react-dom/server";
import MyMatchers from "@lexa79/jest-matchers";

// Add some useful matchers to Jest:
MyMatchers.connectRenderer( ReactDOMServer );
expect.extend( MyMatchers );
```

If you are working with Material UI, you might also have to add the following to `setupTests.js` ([background](stackoverflow.com/questions/58070996/how-to-fix-the-warning-uselayouteffect-does-nothing-on-the-server)):

``` js
import React from "react";

// Avoid problems when testing Material UI components:
React.useLayoutEffect = React.useEffect;
```

# Enhanced snapshots

## Example

``` js
describe( "Component Logo -", () => {
  describe( "when rendering", () => {
    it( "with minimal properties - delivers expected result  (-> check snapshot)", () => {
      // eslint-disable-next-line quotes
      const testString = `<Logo text="" />`;
      const testElement = <Logo text="" />;
      const filename = "Logo-minimal";

      return expect( testElement ).toAsyncMatchNamedHTMLSnapshot( filename, testString );
    } );
  } );
} );
```

`__snapshots__/Logo-minimal.html`:

``` html
<!DOCTYPE html>
<html style="height: 100%;">
  <head>
  </head>
  <body style="display: flex; flex-flow: column nowrap; justify-content: center; align-items: center; height: 100%;">
    <h2>
	  Component Logo when rendering with minimal properties - delivers expected result (-> check snapshot, too)
	</h2>
    <!--[ Content from unit test: ]-->
    <div class="empty-svg">
	</div>
    <!--[ End of included content ]-->
    <br>
	<br>
	&lt;Logo text="" /&gt;
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
return expect( content ).toAsyncMatchNamedHTMLSnapshot( filename, description );
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

* **Parameter `description`** (optional):
  Additional information which shall be included in the snapshot-file

# Planned crashing

## Examples

``` js
describe( "Component Logo -", () => {
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
