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

## Using Angles in your Project

Refer to the demos for examples to set up the various components. Here is what you'll need for a minimal installation:

### The main plugin 
 `dist/angles.js`

###Dependencies 
Find them under `deps` or download your own:

 * [ACE editor](https://github.com/ajaxorg/ace)
 * [underscore.js](http://underscorejs.org/)
 * [backbone.js](http://backbonejs.org/)
 * ACE Angles extension (`deps/ext-angles.js`) (optional for contextual help)
 * [backbone.localstorage](https://github.com/jeromegn/Backbone.localStorage) (optional for save/load component)
 * [FileSaver](https://github.com/eligrey/FileSaver.js) (optional for saving file to disk)

## Development Toolchain

The development up to now has been able to extend the Ace Editor without
requiring modification of the XML mode, so the rest of this section is
nascent until such time that the XML mode must be modified to support some
functionality being added to ANGLES.

Angles is based on the [Ace Editor](http://ace.ajax.org/) and uses `grunt`
to manage its build and testing process. This means that
you need the following installed before you can work on the CoffeeScript
source code:

* grunt

You also need the following Node packages intalled via `npm`:

* grunt-contrib-concat
* grunt-contrib-uglify
* grunt-contrib-clean
* grunt-contrib-watch
* grunt-contrib-watch
* grunt-contrib-qunit
* grunt-contrib-connect
* grunt-contrib-coffee

## Repository Structure

This repository has the following directories:

* build\_support: scripts used during the build process
* demo: simple demonstration page incorporating the Angles mode plugin
* deps: dependencies for Angles, including a build of ace
* dist: the built plugin ready for distribution
* src: the source code for non-ACE components that work with the ACE editor
* test: any unit tests

Development should take place in src/.

## Building the Angles plugins

To build the plugins for ACE, run the following command:

    % grunt

This will build everything and leave the new files in `dist/`.


## Bower and dependencies

Dependencies are a resolved through `bower`. In order to install
dependencies, run the `install` command:

```
$ bower install
```

http://sindresorhus.com/bower-components/

