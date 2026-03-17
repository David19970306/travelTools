import { validateSchema } from './schema.js';

const SELF_CLOSING_TAGS = new Set(['img', 'input']);

const TYPE_TO_TAG = {
  page: 'main',
  container: 'section',
  text: 'p',
  button: 'button',
  image: 'img',
  input: 'input'
};

/**
 * @param {string} value
 */
function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * @param {Record<string, string | number | boolean> | undefined} props
 */
function toAttributeString(props = {}) {
  return Object.entries(props)
    .filter(([key]) => key !== 'text')
    .filter(([, value]) => value !== false && value !== undefined && value !== null)
    .map(([key, value]) => {
      if (value === true) {
        return `${key}`;
      }

      return `${key}="${escapeHtml(String(value))}"`;
    })
    .join(' ');
}

/**
 * @param {import('./schema.js').A2UINode} node
 */
function renderNode(node) {
  if (!node.type) {
    throw new Error('Each node must include a "type" field.');
  }

  const tag = TYPE_TO_TAG[node.type] ?? node.type;
  const attrString = toAttributeString(node.props);
  const openTag = attrString ? `<${tag} ${attrString}>` : `<${tag}>`;

  if (SELF_CLOSING_TAGS.has(tag)) {
    return attrString ? `<${tag} ${attrString} />` : `<${tag} />`;
  }

  const children = node.children?.map(renderNode).join('') ?? '';
  const text = typeof node.props?.text === 'string' ? escapeHtml(node.props.text) : '';

  if (text && children) {
    throw new Error('Node cannot include both props.text and children.');
  }

  return `${openTag}${text}${children}</${tag}>`;
}

/**
 * @param {{version: string, root: import('./schema.js').A2UINode}} schema
 */
export function renderToString(schema) {
  const typed = validateSchema(schema);
  return renderNode(typed.root);
}

/**
 * @param {Element} mountPoint
 * @param {{version: string, root: import('./schema.js').A2UINode}} schema
 */
export function render(mountPoint, schema) {
  if (!mountPoint || typeof mountPoint.innerHTML !== 'string') {
    throw new TypeError('mountPoint must be a DOM Element.');
  }

  mountPoint.innerHTML = renderToString(schema);
}
