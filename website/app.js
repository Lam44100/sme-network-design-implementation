(function () {
  'use strict';
  const model = window.NetworkModel;
  const $ = id => document.getElementById(id);
  let step = 0;
  let result;
  let selected = null;
  function showDevice(id) {
    selected = id;
    const d = model.devices[id];
    const panel = $('device-info');
    panel.replaceChildren();
    const type = document.createElement('p'); type.className = 'eyebrow'; type.textContent = d.type;
    const title = document.createElement('h3'); title.textContent = d.name;
    const text = document.createElement('p'); text.textContent = d.detail;
    const facts = document.createElement('dl'); facts.className = 'facts';
    [['Address', d.address], ['Gateway / route', d.gateway], ['Connection', d.connection]].forEach(([label, value]) => {
      const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = label; dd.textContent = value; row.append(dt, dd); facts.append(row);
    });
    panel.append(type, title, text, facts);
    document.querySelectorAll('[data-device]').forEach(node => node.classList.toggle('selected', node.dataset.device === selected));
  }
  function edgeKey(a, b) { return [a, b].sort().join('-'); }
  function render() {
    const members = [$('member-a').checked, $('member-b').checked];
    result = model.route($('source').value, $('destination').value, members, $('reply').checked);
    step = Math.min(step, result.nodes.length - 1);
    const status = $('route-status');
    status.classList.toggle('unavailable', !result.reachable);
    status.textContent = !result.reachable ? 'No path in this model: both inter-switch members are disabled.' : result.local ? 'Local endpoint selected: no network traversal.' : result.crossesBundle && result.activeMembers === 1 ? 'Expected path available through one remaining bundle member.' : 'Expected path available under the documented design.';
    $('member-status').textContent = `${result.activeMembers} of 2 members enabled`;
    const path = $('path-list'); path.replaceChildren();
    result.nodes.forEach((id, i) => { const li = document.createElement('li'), span = document.createElement('span'); span.textContent = model.devices[id].name; if (result.reachable && i === step) li.setAttribute('aria-current', 'step'); li.append(span); path.append(li); });
    $('step-title').textContent = result.reachable ? `${result.reply ? 'Reply' : 'Forward'} path · ${model.devices[result.nodes[step]].name}` : 'Why this path needs the bundle';
    $('step-explanation').textContent = result.reachable ? model.explain(result, step) : 'SW2 needs SW1 to reach the VLAN gateways on R1. Even guest-to-management traffic on the same switch needs R1 because those PCs are in different VLANs. Re-enable a member or choose a path confined to SW1 and the routers.';
    $('step-count').textContent = result.reachable ? `Step ${step + 1} of ${result.nodes.length}` : 'Traversal paused';
    $('next-step').disabled = !result.reachable || step === result.nodes.length - 1;
    $('next-step').textContent = result.reachable && step === result.nodes.length - 1 ? 'Path complete' : 'Next hop →';
    const traversed = new Set();
    if (result.reachable) for (let i = 1; i <= step; i++) traversed.add(edgeKey(result.nodes[i - 1], result.nodes[i]));
    document.querySelectorAll('[data-edge]').forEach(edge => {
      const member = edge.dataset.member;
      const disabled = member !== undefined && !members[Number(member)];
      // Illustrate one eligible member per flow, not a packet duplicated over both links.
      const chosen = member === undefined || Number(member) === (members[0] ? 0 : 1);
      edge.classList.toggle('link-down', disabled);
      edge.classList.toggle('walked', traversed.has(edge.dataset.edge) && !disabled && chosen);
    });
    document.querySelectorAll('[data-device]').forEach(node => node.classList.toggle('current', result.reachable && node.dataset.device === result.nodes[step]));
    showDevice(result.nodes[step]);
  }
  ['source', 'destination', 'reply', 'member-a', 'member-b'].forEach(id => $(id).addEventListener('change', () => { step = 0; render(); }));
  $('next-step').addEventListener('click', () => { if (result.reachable && step < result.nodes.length - 1) { step++; render(); } });
  $('reset').addEventListener('click', () => { step = 0; render(); });
  document.querySelectorAll('[data-source]').forEach(button => button.addEventListener('click', () => { $('source').value = button.dataset.source; $('destination').value = button.dataset.destination; $('reply').checked = false; step = 0; render(); }));
  document.querySelectorAll('[data-device]').forEach(node => {
    node.addEventListener('click', () => showDevice(node.dataset.device));
    node.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showDevice(node.dataset.device); } });
  });
  $('copy-commands').addEventListener('click', async () => {
    const text = $('demo-commands').textContent;
    try { if (!navigator.clipboard) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(text); $('copy-status').textContent = 'Commands copied. Run them in Packet Tracer, one at a time.'; }
    catch (_) { const range = document.createRange(); range.selectNodeContents($('demo-commands')); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); $('copy-status').textContent = 'Commands selected. Press Ctrl+C (or Command+C) to copy.'; }
  });
  render();
})();
