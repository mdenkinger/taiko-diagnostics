import { resolve } from 'path';
import { pathToFileURL } from 'url';

export function location(path) {
  let file = resolve(path);
  return pathToFileURL(file).toString();
}
