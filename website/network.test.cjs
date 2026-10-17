const assert = require('node:assert/strict');
const { test } = require('node:test');
const model = require('./network.js');

test('guest reaches the external network through both switches and routers', () => {
  assert.deepEqual(model.route('guest', 'external').nodes, ['guest', 'sw2', 'sw1', 'r1', 'r2', 'external']);
});
test('inter-VLAN traffic on SW1 still traverses R1', () => {
  assert.deepEqual(model.route('staff', 'student').nodes, ['staff', 'sw1', 'r1', 'sw1', 'student']);
});
test('guest-to-management is permitted and routed, even though both PCs attach to SW2', () => {
  const route = model.route('guest', 'management');
  assert.equal(route.reachable, true);
  assert.deepEqual(route.nodes, ['guest', 'sw2', 'sw1', 'r1', 'sw1', 'sw2', 'management']);
});
test('one surviving member preserves an illustrated cross-switch path', () => {
  for (const members of [[true, false], [false, true]]) assert.equal(model.route('guest', 'external', members).reachable, true);
});
test('both failed members isolate SW2 from its router-on-a-stick gateways', () => {
  assert.equal(model.route('guest', 'external', [false, false]).reachable, false);
  assert.equal(model.route('guest', 'management', [false, false]).reachable, false);
});
test('bundle outage does not affect SW1 endpoints or the external side', () => {
  assert.equal(model.route('staff', 'student', [false, false]).reachable, true);
  assert.equal(model.route('staff', 'external', [false, false]).reachable, true);
});
test('reply follows reverse path and explains the R2 return route', () => {
  const reply = model.route('guest', 'external', [true, true], true);
  assert.deepEqual(reply.nodes, ['external', 'r2', 'r1', 'sw1', 'sw2', 'guest']);
  assert.match(model.explain(reply, 1), /return route via 203\.0\.113\.1/);
});
test('local endpoint traffic does not depend on the bundle', () => {
  const route = model.route('guest', 'guest', [false, false]);
  assert.equal(route.local, true); assert.equal(route.reachable, true); assert.deepEqual(route.nodes, ['guest']);
});
test('unknown endpoints and invalid member states are rejected', () => {
  assert.throws(() => model.route('unknown', 'staff'));
  assert.throws(() => model.route('staff', 'guest', [true]));
  assert.throws(() => model.route('staff', 'guest', [true, 'false']));
});
test('every supported endpoint pair has a complete explanatory path in both directions', () => {
  for (const from of model.endpoints) for (const to of model.endpoints) for (const reply of [false, true]) {
    const route = model.route(from, to, [true, true], reply);
    assert.equal(route.nodes[0], reply ? to : from);
    assert.equal(route.nodes.at(-1), reply ? from : to);
    route.nodes.forEach((_, i) => assert.ok(model.explain(route, i).length));
  }
});
