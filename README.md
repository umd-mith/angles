# Angles

The ANGLES Project is a research project aimed at developing a 
lightweight, online XML code editor, which can support teaching of 
text encoding as well as text encoding research projects, either by 
distributed research teams or at institutions without resources to 
purchase expensive software licenses. By combining the model of 
intensive code development (a.k.a. the "code sprint") with testing 
and feedback by domain experts gathered at nationally-recognized 
disciplinary conferences, the project proposes a bridge between 
humanities centers who have greater resources to program scholarly 
software and the scholars who form the core user community for such 
software through their teaching and research.

## Repository Structure

This repository has the following directories:

* demo: simple demonstration page incorporating the Angles mode plugin. This demo assumes that you have installed the needed dependencies using `bower`.
* dist: the built plugin ready for distribution.
* src: the source code for non-ACE components that work with the ACE editor.
* test: any unit tests.

## Using Angles in your Project

Refer to the demos for examples to set up the various components. A minimal installation of Angles would include the Angles plugin and the required dependencies listed below.

### The Angles plugin

When built, the main plugin will be in `dist/angles.js`. You may also install the most recent distribution using `bower`. (See [bower.io](http://bower.io/#installing-bower) for information on installing and using `bower`.)

```
$ bower install angles-tei
```

The plugin will be in `bower_components/angles/dist/angles.js`. The required dependencies (see below) will also be installed. However, optional dependencies will need to be installed separately.

### Dependencies 

#### Required Dependencies

You may download the primary dependencies using `bower` or download your own. (See [bower.io](http://bower.io/#installing-bower) for information on installing and using `bower`.)

From the top directory of the repository, you may run `bower`:

```
$ bower install
```

or

```
$ bower install jQuery
$ bower install ace-builds
$ bower install underscore
$ bower install backbone
```

This will install the dependencies into `bower_components`.

* [jQuery](https://jquery.com/)
* [ACE editor](http://ace.c9.io/)
* [underscore.js](http://underscorejs.org/)
* [backbone.js](http://backbonejs.org/)

#### Optional Dependencies

The following dependencies are optional and are not included in the `bower` configuration:

```
$ bower install Backbone.localStorage
$ bower install FileSaver
```

* [Backbone.localStorage](https://github.com/jeromegn/Backbone.localStorage) (optional for save/load component)
* [FileSaver](https://github.com/eligrey/FileSaver.js) (optional for saving file to disk)

#### ACE Angles Extension

* ACE Angles extension (`deps/ext-angles.js`) (optional for contextual help)

## Development Toolchain

Angles is based on the [Ace Editor](http://ace.ajax.org/) and uses `grunt`
to manage its build and testing process. This means that
you need the following installed before you can work on the CoffeeScript
source code:

* grunt (see [the `grunt` getting started guide](http://gruntjs.com/getting-started))

```
$ npm install -g grunt-cli
```

You also need the following Node packages intalled via `npm`:

* grunt-contrib-uglify
* grunt-contrib-clean
* grunt-contrib-qunit
* grunt-contrib-coffee

```
$ npm install grunt-contrib-uglify
$ npm install grunt-contrib-clean
$ npm install grunt-contrib-qunit
$ npm install grunt-contrib-coffee
```

### Building

To build the plugins for ACE, run the following command:

```
$ grunt
```

This will build everything and leave the new files in `dist/`.

### Testing

The tests assume that you have installed the required dependencies using `bower`.

#### Headless Testing

You may run tests without a browser using `grunt` if you have [PhantomJS](http://phantomjs.org/) installed.

```
$ grunt test
```

#### In-Browser Testing

You may also run the tests in your browser by loading the `test/angles.html` page. Any errors will be highlighted in the web page. You may also want to view the browser's console log for additional error messages or stack traces if there are errors.