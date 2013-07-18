(function() {
  /*
     ======== A Handy Little QUnit Reference ========
http://api.qunitjs.com/

Test methods:
module(name, {[setup][ ,teardown]})
test(name, callback)
expect(numberOfAssertions)
stop(increment)
start(decrement)
Test assertions:
ok(value, [message])
equal(actual, expected, [message])
notEqual(actual, expected, [message])
deepEqual(actual, expected, [message])
notDeepEqual(actual, expected, [message])
strictEqual(actual, expected, [message])
notStrictEqual(actual, expected, [message])
throws(block, [expected], [message])
*/

  test("Check Ace namespace", function() {
    ok(typeof ace !== "undefined" && ace !== null, "Ace namespace defined");
  });

  test("Check Underscore namespace", function() {
    ok(typeof _ !== "undefined" && _ !== null, "Underscore namespace defined");
  });

  test("Check Backbone namespace", function() {
    ok(typeof Backbone !== "undefined" && Backbone !== null, "Backbone namepsace defined");
  });

  test("Check Angles Namespace", function() {
    expect(1);
    ok(typeof Angles !== "undefined" && Angles !== null, "Angles namespace defined");
  });

})();
