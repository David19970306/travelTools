const SUPPORTED_VERSION = '0.9';

/**
 * @param {unknown} schema
 */
export function validateSchema(schema) {
  if (!schema || typeof schema !== 'object') {
    throw new TypeError('A2UI schema must be an object.');
  }

  const typed = /** @type {{version?: string, root?: object}} */ (schema);

  if (typed.version !== SUPPORTED_VERSION) {
    throw new Error(`Unsupported A2UI version: ${typed.version ?? 'unknown'}. Expected ${SUPPORTED_VERSION}.`);
  }

  if (!typed.root || typeof typed.root !== 'object') {
    throw new Error('A2UI schema root node is required.');
  }

  return /** @type {{version: string, root: A2UINode}} */ (typed);
}

/**
 * @typedef {Object} A2UINode
 * @property {string} type
 * @property {Record<string, string | number | boolean>=} props
 * @property {A2UINode[]=} children
 */

export { SUPPORTED_VERSION };
