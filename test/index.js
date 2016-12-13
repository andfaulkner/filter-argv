// Store original process.argv
const oldProcArgs = Object.assign({}, process.argv);

process.env.__FILTER_ARGV_MOCHA_MODULE_TESTING__ = true;

/************************************** THIRD-PARTY IMPORTS ***************************************/
const { expect } = require('chai');
const mocha = require('mocha');
const partial = require('lodash.partial');

/*************************************** TESTED FILE IMPORT ***************************************/
const { filteredArgv, startDashesThenNonDashes, validateOpts,
        startsWithDash, isAssignmentFlagArg, isStandaloneDashes } = require('../index');

/********************************************* TESTS **********************************************/
describe('index.js', function() {
    it('index.js exists', function() {
      expect(filteredArgv).to.exist;
    });

    describe('validateOpts', function() {
        it('throws error if given options object with invalid value for assignments', function () {
            expect(partial(validateOpts, {})).to.throw(TypeError);
            expect(partial(validateOpts, { assignments: 'gr argh' })).to.throw(TypeError);
        });
        it('returns ok if given options object with valid value for assignments', function () {
            expect(partial(validateOpts, { assignments: 'all' })).to.not.throw(TypeError);
            expect(partial(validateOpts, { assignments: 'none' })).to.not.throw(TypeError);
            
            // the noflag option is set up to be forgiving. The right variant
            // is hard to remember, so I allowed all of them.
            expect(partial(validateOpts, { assignments: 'noflag' })).to.not.throw(TypeError);
            expect(partial(validateOpts, { assignments: 'noflags' })).to.not.throw(TypeError);
            expect(partial(validateOpts, { assignments: 'no-flag' })).to.not.throw(TypeError);
            expect(partial(validateOpts, { assignments: 'no-flags' })).to.not.throw(TypeError);
            expect(partial(validateOpts, { assignments: 'noFlag' })).to.not.throw(TypeError);
            expect(partial(validateOpts, { assignments: 'noFlags' })).to.not.throw(TypeError);
            expect(partial(validateOpts, { assignments: 'no-Flag' })).to.not.throw(TypeError);
            expect(partial(validateOpts, { assignments: 'no-Flags' })).to.not.throw(TypeError);

            expect(partial(validateOpts, { assignments: 'nFlgs' })).to.throw(TypeError);
        });
    })

    describe('startDashesThenNonDashes', function() {
        it('is true for string starting with -- or - followed by other chars', function () {
            ['--asdf', '--1v4f', '-vtrb', '-Z', '-a', '-1', '--5', '-43'].forEach((arg) => {
                expect(startDashesThenNonDashes(arg)).to.be.true;
            });
            ['--', '-', '', 'ege', 'erg'].forEach((arg) => {
                expect(startDashesThenNonDashes(arg)).to.be.false;
            })
        });
    });

    describe('startsWithDash', function() {
        it('is true for items that start with dash, false for items that do not', function() {
            ['--asd', '--1f4', '-VT', '-Z', '-a', '-1', '--5', '-43', '--', '-'].forEach((arg) => {
                expect(startsWithDash(arg)).to.be.true;
            });
            [
                'asd', '54g5', '!!R#F', 'br', '', '<div>aerf</div>', 'uge-ar', '44------t', 'a--'
            ].forEach((arg) => {
                    expect(startsWithDash(arg)).to.be.false;
                });
        });
    });

    describe('isAssignmentFlagArg', function() {
        it('is true for all items w >= 1 alphanumeric char or _ at any point before an =, unless ' +
                'the pre-= text is quoted & the surrounding quote types don\'t match', function() {
            [ '--gr=argh', '--sig=-', '--v=things',
              '--a-v-d=ok-ya', '--"erg"=fgre', "--'erg'=fgre"
            ].forEach((arg) => {
                expect(isAssignmentFlagArg(arg)).to.be.true;
            });
            [ 'fw', 'btb', '', '4345345', '=', '-=', '-=-', '=gegr',
              '==ergeg', '--==awga', `--'erg"=fgre`
            ].forEach((arg) => {
                expect(isAssignmentFlagArg(arg)).to.be.false;
            });
        });
    });

    describe('isStandaloneDashes', function() {
        it('is true for args consisting of 1, 2 or 3 standalone dashes & nothing else', function() {
            ['---', '--', '--'].forEach((arg) => {
                expect(isStandaloneDashes(arg)).to.be.true;
            });
            ['', '--eraesg', '124', '--wef=erg--', '--grf=a2#@#--g--', '3', '"'].forEach((arg) => {
                expect(isStandaloneDashes(arg)).to.be.false;
            });
        })
    });

    describe('filteredArgv', function() {
        it('exists', function () { expect(filteredArgv).to.exist });

        it('does not exclude items not prefixed with - or -- from arrays given', function() {
            expect(filteredArgv(['asdf'])).to.eql(['asdf']);
        });

        it('excludes items prefixed with - or -- from arrays', function() {
            const testArray1 = ['asdf', '--ok', '-v', 'ntyo'];
            expect(filteredArgv(testArray1)).to.eql(['asdf', 'ntyo']);
        });

        it('defaults to using process.argv as arrayList if no argument given', function () {
            process.argv = ['argOne', 'argTwo', 'argThree'];
            expect(filteredArgv()).to.eql(process.argv);

            process.argv = ['argOne', 'argTwo', '--flag', 'argThree'];
            expect(filteredArgv()).to.eql(['argOne', 'argTwo', 'argThree']);
   
            process.argv = Object.assign({}, oldProcArgs); // restore args
        });

        it('keeps args w/ an = preceded & followed by at least 1 non-dash char', function () {
            process.argv = ['argOne', 'argTwo', 'argThree', '--name=my-component'];
            expect(filteredArgv()).to.eql(process.argv);
            process.argv = Object.assign({}, oldProcArgs); // restore args
        });

        it('by default excludes standalone -- or -', function () {
            process.argv = ['--', '-'];
            expect(filteredArgv()).to.eql([]);
            process.argv = Object.assign({}, oldProcArgs); // restore args
        });

        it('if requested, can keep standalone -- or -', function () {
            process.argv = ['--', '-'];
            expect(filteredArgv({ keepLonelyDashes: true })).to.eql(['--', '-']);
            expect(filteredArgv({ keepLonelyDashes: false })).to.be.empty;

            process.argv = ['asdf', '--', '-', '--v'];
            expect(filteredArgv({ keepLonelyDashes: true })).to.eql(['asdf', '--', '-']);

            process.argv = Object.assign({}, oldProcArgs); // restore args
        });

        it('can optionally exclude assignment args e.g. --name=asdf <-default included', function () {
            process.argv = ['--name=meeka', 'name=meeka'];
            expect(filteredArgv({ assignments: 'all' })).to.eql(['--name=meeka', 'name=meeka']);
            expect(filteredArgv({ assignments: 'noFlags' })).to.eql(['name=meeka']);
            expect(filteredArgv({ assignments: 'none' })).to.be.empty;
            process.argv = Object.assign({}, oldProcArgs); // restore args
        });


    });

});

// Restore original process.argv
process.argv = Object.assign({}, oldProcArgs);
