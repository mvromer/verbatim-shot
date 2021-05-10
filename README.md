# verbatim-shot
Snapshot testing where your snapshots contain exactly the output you expect.

## Prerequisites

This requires the following minimum versions:

* Node 14 (previous versions may work but are untested)
* Mocha 8
* Chai 4

## Install

First, install `verbatim-shot` as a dev dependency:

```sh
npm install --save-dev verbatim-shot
```

Then, use the `verbatim-shot/require` module to register the root hooks when calling Mocha to ensure
`verbatim-shot` helpers and state are setup for use in your tests:

```sh
mocha --require verbatim-shot/require
```

## Use

Inside your tests, use the `matchVerbatimSnapshot` chain method like you would any other Chai
method. The following example uses Chai's `expect`assertion style:

```javascript
const snapshotContents = someFunctionUnderTest();
expect(snapshotContents).to.matchVerbatimSnapshot();
```

The asserted value is the snapshot contents to test against the previously saved snapshot. Each test
(i.e., `it` call) should have at most one call to `matchVerbatimSnapshot`.


## How it works

For each test file, `verbatim-shot` maintains a manifest. The manifest contains entries for each
test defined in the test file. The most important piece of data each entry stores is the path to the
snapshot file for the corresponding test.

A manifest entry for a test is identified by the *test's key*. The test key is built from the test's
description and the description of each `context`/`describe` leading from the root of the test file
to the test itself. As an example, suppose `test.js` had the following:

```javascript
describe('someTestFunction', function() {
  context('when it is called', function() {
    it('should work', function() {
        // ... test code ...
    });
  });
});
```

The test key for the above test would be `someTestFunction when it is called should work`. The
actual snapshot's file name is built from a truncated hash of the test key. Thus, changing either
any aspect of the test key or the file in which the test is defined will cause a new snapshot file
to be created.

## Motivation

In most situations, you probably should *not* use this package. There are already a lot of other
great snapshot libraries for use in Mocha/Chai that have a whole more features. Some examples that
I looked at prior to writing `verbatim-shot`:

* [snap-shot-it](https://www.npmjs.com/package/snap-shot-it)
* [chai-snapshot-matcher](https://www.npmjs.com/package/chai-snapshot-matcher)
* [mocha-snapshots](https://www.npmjs.com/package/mocha-snapshots)

However, in all the cases I saw, the snapshot files these libraries (and others) wrote were either
essentially JavaScript files or they had contents parsed as JavaScript. In another project I worked
on ([rollup-plugin-tagged-template-postcss](https://github.com/mvromer/rollup-plugin-tagged-template-postcss)),
this made it hard to create test snapshots and easily review their contents to make sure they were
what they ought to be.

That project in particular defined a Rollup plugin that parsed out the contents of tagged template
literals, run the contents through PostCSS, and then replace the original tagged template literal
contents with the transformed contents. The plugin also had to ensure that the transformed contents,
once reinserted into the JavaScript source, were still syntactically valid, which meant potentially
escaping parts of the output. Serializing these escaped contents with the current crop of snapshot
libraries created snapshot files that had to escape my escaped content. Reading these for some of
the more involved tests became a pain.

In the end, what I wanted was the ability to write a snapshot that contained the *exact* contents I
would expect to see in the transformed tagged template literal contents. Hence the birth of
`verbatim-shot`, the snapshot library that lets you do snapshot testing where your snapshots contain
exactly the output you expect.
