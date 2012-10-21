.PHONY : doc build clean dist

pre_build:
	git rev-parse HEAD > .git-ref
	mkdir -p build/src
	
build: pre_build
	./Makefile.dryice.js angles

clean:
	rm -rf build
	rm -rf dist

angles: build
	mkdir -p dist
	mv build/src/mode-tei.js dist/
	rmdir build/src build

dist: clean build angles
