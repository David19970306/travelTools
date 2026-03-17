import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  buildEventPayload,
  parseProtocol,
  renderProtocolToString,
  renderToString
} from '../src/index.js';

const billSample = JSON.parse(fs.readFileSync(new URL('../examples/basic.json', import.meta.url), 'utf-8'));

const simpleSample = {
  version: '0.9',
  root: {
    type: 'page',
    props: { class: 'landing-page' },
    children: [
      {
        type: 'container',
        props: { class: 'hero' },
        children: [
          { type: 'text', props: { text: 'Welcome to A2UI' } },
          { type: 'button', props: { text: 'Start', id: 'start-btn' } }
        ]
      }
    ]
  }
};

test('renderToString renders nested A2UI tree', () => {
  const html = renderToString(simpleSample);
  assert.equal(
    html,
    '<main class="landing-page"><section class="hero"><p>Welcome to A2UI</p><button id="start-btn">Start</button></section></main>'
  );
});

test('renderProtocolToString renders bill scenario', () => {
  const html = renderProtocolToString(billSample);
  assert.match(html, /生活缴费/);
  assert.match(html, /缴费类型：/);
  assert.match(html, /ChoicePicker/);
  assert.match(html, /确认/);
});

test('buildEventPayload follows sendDataModel and path resolution', () => {
  const payload = buildEventPayload(billSample, 'footer-btn', { '账单类型': ['电费'] });
  assert.deepEqual(payload, {
    event: {
      name: 'submit_clarification',
      context: {
        intent_code: 'queryBill',
        账单类型: ['电费'],
        source_agent: 'mcp'
      }
    },
    dataModel: {
      账单类型: ['电费']
    },
    metadata: {
      surfaceId: 's_bill'
    }
  });
});

test('parseProtocol rejects invalid version', () => {
  assert.throws(
    () => parseProtocol({ ...billSample, version: '0.9' }),
    /Unsupported protocol version/
  );
});
