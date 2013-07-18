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

## Documentation

* [Ace API Reference](http://ace.ajax.org/#nav=api)
* [Sprint Planning](https://github.com/umd-mith/angles/wiki/Sprint-Planning)

## Development Toolchain

The development up to now has been able to extend the Ace Editor without
requiring modification of the XML mode, so the rest of this section is
nascent until such time that the XML mode must be modified to support some
functionality being added to ANGLES.

Angles is based on the [Ace Editor](http://ace.ajax.org/) and derives its
build environment from that used by the Ace development team. This means that
you need the following installed before you can work on the JavaScript
source code for the TEI mode:

* make
* node

You also need the following Node package intalled via `npm`:

* dryice

## Repository Structure

This repository has the following directories:

* build\_support: scripts used during the build process
* demo: simple demonstration page incorporating the Angles mode plugin
* deps: dependencies for the demonstration page, including a build of ace
* dist: the built plugin ready for distribution
* lib: the source code of ACE as well as Angles
    - lib/ace: The source code for ACE used during the build process
    - lib/angles: The source code for the Angles plugins for ACE
* test: any unit tests

Development should take place under lib/angles. No changes to files under
lib/ace will be accepted since those are used only as reference during the
build process and are not part of the final build product.

## Building the Angles plugins

To build the plugins for ACE, run the following command:

    % make angles

This will build everything and leave the new files in `dist/`.

