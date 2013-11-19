# ANGLES

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

* demo: simple demonstration page incorporating the ANGLES mode plugin. This demo assumes that you have installed the needed dependencies using `bower`.
* dist: the built plugin ready for distribution.
* src: the source code for non-ACE components that work with the ACE editor.
* test: any unit tests.
* vendor: dependencies not available through `bower`

**N.B.**: You will need to clone this repository recursively to capture the dependencies in `vendor/`:

```
$ git clone --recursive https://github.com/umd-mith/angles.git
```

## Development Toolchain

ANGLES is based on the [Ace Editor](http://ace.ajax.org/) and uses `grunt`
to manage its build and testing process. This means that
you need the following installed before you can work on the CoffeeScript
source code:

* node.js (see [the guide to installing Node.js via package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager); you will need a recent version of node.js)
* grunt (see [the `grunt` getting started guide](http://gruntjs.com/getting-started))
* bower

```
$ npm install -g grunt-cli
$ npm install -g bower
```

You also need the following Node packages intalled via `npm`:

* grunt-contrib-uglify
* grunt-contrib-clean
* grunt-contrib-qunit
* grunt-contrib-coffee
* rimraf
* shelljs

```
$ npm install grunt-contrib-uglify
$ npm install grunt-contrib-clean
$ npm install grunt-contrib-qunit
$ npm install grunt-contrib-coffee
$ npm install rimraf
$ npm install shelljs
```

You can also install these dependencies by running

```
$ npm install
```

in your clone of the repository.

### Building

To build the plugins for ACE, run the following command:

```
$ grunt
```

This will build everything and leave the new files in `dist/`. In addition, all required and optional JavaScript dependencies managed through `bower` will be downloaded and placed in the `bower_components/` directory.

### Testing

The tests assume that you have installed the required dependencies using `bower`.

#### Headless Testing

You may run tests without a browser using `grunt` if you have [PhantomJS](http://phantomjs.org/) installed.

```
$ grunt test
```

#### In-Browser Testing

You may also run the tests in your browser by loading the `test/angles.html` page. Any errors will be highlighted in the web page. You may also want to view the browser's console log for additional error messages or stack traces if there are errors.
## Using ANGLES in your Project

Refer to the demos for examples to set up the various components. A minimal installation of ANGLES would include the ANGLES plugin and the required dependencies listed below.

### The ANGLES plugin

When built, the main plugin will be in `dist/angles.js`. You may also install the most recent distribution using `bower`. (See [bower.io](http://bower.io/#installing-bower) for information on installing and using `bower`.)

```
$ bower install angles-tei
```

The plugin will be in `bower_components/angles/dist/angles.js`. The required dependencies (see below) will also be installed. However, optional dependencies will need to be installed separately.

### Dependencies

ANGLES has a number of JavaScript libraries on which it depends. These may be installed using `bower` or using `grunt`, though `grunt` will require that `bower` be installed.

To use `grunt` to manage `bower` and install all dependencies, both required and optional, run:

```
$ grunt install-deps
```

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

### Demo

A number of demonstrations are available in the `demo/` directory. See [the README](./demo/README.md) in that directory for more information.

You can ensure everything is built and dependencies are downloaded by running

```
$ grunt demo
```

This will also print out a list of demonstration files that you may open in your browser.

### Cleaning Files

After building ANGLES or installing JavaScript libraries with `bower`, you can clean the `dist/` and `bower_components/` directories by running:

```
$ grunt clean
```

To remove any locally installed node modules, you may run:

```
$ grunt real-clean
```