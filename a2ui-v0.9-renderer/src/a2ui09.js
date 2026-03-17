const SUPPORTED_PROTOCOL_VERSION = 'v0.9';

/** @param {string} path */
function readByPath(model, path) {
  if (path === '/' || !path) return model;
  const keys = path.replace(/^\//, '').split('/').filter(Boolean);
  let cursor = model;
  for (const key of keys) {
    if (cursor == null || typeof cursor !== 'object') return undefined;
    cursor = cursor[key];
  }
  return cursor;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function resolveDynamic(value, model) {
  if (value && typeof value === 'object' && 'path' in value && typeof value.path === 'string') {
    return readByPath(model, value.path);
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveDynamic(item, model));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveDynamic(v, model)]));
  }

  return value;
}

/**
 * @param {{ version?: string, datas?: Array<Record<string, unknown>> }} payload
 */
export function parseProtocol(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new TypeError('A2UI v0.9 payload must be an object.');
  }
  if (payload.version !== SUPPORTED_PROTOCOL_VERSION) {
    throw new Error(`Unsupported protocol version: ${payload.version ?? 'unknown'}. Expected ${SUPPORTED_PROTOCOL_VERSION}.`);
  }
  if (!Array.isArray(payload.datas) || payload.datas.length === 0) {
    throw new Error('A2UI v0.9 payload.datas must be a non-empty array.');
  }

  /** @type {{
   * surfaceId: string,
   * sendDataModel: boolean,
   * catalogId: string,
   * theme: Record<string, string>,
   * components: Record<string, Record<string, any>>,
   * rootId: string,
   * dataModel: Record<string, any>
   * }} */
  const state = {
    surfaceId: '',
    sendDataModel: false,
    catalogId: '',
    theme: {},
    components: {},
    rootId: 'root',
    dataModel: {}
  };

  for (const block of payload.datas) {
    if (block.createSurface) {
      const msg = /** @type {any} */ (block.createSurface);
      state.surfaceId = msg.surfaceId;
      state.sendDataModel = Boolean(msg.sendDataModel);
      state.catalogId = msg.catalogId ?? '';
      state.theme = msg.theme ?? {};
    }

    if (block.updateComponents) {
      const msg = /** @type {any} */ (block.updateComponents);
      for (const component of msg.components ?? []) {
        if (!component.id || !component.component) {
          throw new Error('Every component must contain id and component fields.');
        }
        state.components[component.id] = component;
      }
      if (state.components.root) {
        state.rootId = 'root';
      }
    }

    if (block.updateDataModel) {
      const msg = /** @type {any} */ (block.updateDataModel);
      if (msg.path === '/') {
        state.dataModel = deepClone(msg.value ?? {});
      }
    }
  }

  if (!state.surfaceId) {
    throw new Error('createSurface is required and must contain surfaceId.');
  }

  if (!state.components[state.rootId]) {
    throw new Error('updateComponents must define root component with id "root".');
  }

  return state;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderComponent(component, map, model) {
  const renderedChildren = (component.children ?? []).map((id) => renderComponent(map[id], map, model)).join('');

  switch (component.component) {
    case 'Column':
      return `<div data-component="Column" id="${escapeHtml(component.id)}">${renderedChildren}</div>`;
    case 'Row':
      return `<div data-component="Row" id="${escapeHtml(component.id)}">${renderedChildren}</div>`;
    case 'Text': {
      const bindKey = component.bindText;
      let text = component.text ?? '';
      if (bindKey) {
        text = text.replaceAll(`{{${bindKey}}}`, String(model?.[bindKey] ?? ''));
      }
      return `<span data-component="Text" id="${escapeHtml(component.id)}">${escapeHtml(text)}</span>`;
    }
    case 'ChoicePicker': {
      const selected = resolveDynamic(component.value, model);
      const selectedSet = new Set(Array.isArray(selected) ? selected : [selected].filter(Boolean));
      const options = (component.options ?? [])
        .map((opt) => {
          const isSelected = selectedSet.has(opt.value) ? ' data-selected="true"' : '';
          return `<li${isSelected}>${escapeHtml(opt.label)}</li>`;
        })
        .join('');
      return `<ul data-component="ChoicePicker" id="${escapeHtml(component.id)}">${options}</ul>`;
    }
    case 'Button': {
      const childHtml = component.child ? renderComponent(map[component.child], map, model) : renderedChildren;
      return `<button data-component="Button" id="${escapeHtml(component.id)}">${childHtml}</button>`;
    }
    default:
      return `<div data-component="${escapeHtml(component.component)}" id="${escapeHtml(component.id)}">${renderedChildren}</div>`;
  }
}

/** @param {{version?: string, datas?: Array<Record<string, unknown>>}} payload */
export function renderProtocolToString(payload) {
  const state = parseProtocol(payload);
  const root = state.components[state.rootId];
  return renderComponent(root, state.components, state.dataModel);
}

/**
 * @param {{version?: string, datas?: Array<Record<string, unknown>>}} payload
 * @param {string} componentId
 * @param {Record<string, unknown>} dataModelPatch
 */
export function buildEventPayload(payload, componentId, dataModelPatch = {}) {
  const state = parseProtocol(payload);
  const component = state.components[componentId];
  if (!component || !component.action?.event) {
    throw new Error(`Component ${componentId} does not contain action.event.`);
  }

  const nextModel = { ...state.dataModel, ...dataModelPatch };
  const event = component.action.event;

  /** @type {Record<string, unknown>} */
  const context = {};
  for (const [key, value] of Object.entries(event.context ?? {})) {
    context[key] = resolveDynamic(value, nextModel);
  }

  const result = {
    event: {
      name: event.name,
      context
    },
    metadata: {
      surfaceId: state.surfaceId
    }
  };

  if (state.sendDataModel) {
    result.dataModel = nextModel;
  }

  return result;
}

export { SUPPORTED_PROTOCOL_VERSION };
