import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const defaultProjectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceExtensions = /\.(?:[cm]?[jt]sx?|css|html|json)$/i;

// Check supplied references without changing files; callers can test a missing path directly.
export function checkImagePaths(references, { projectRoot = defaultProjectRoot } = {}) {
  const imagesRoot = resolve(projectRoot, 'public', 'images');
  const errors = [];
  const checkedPaths = [];
  for (const reference of references) {
    const imagePath = typeof reference === 'string' ? reference : reference.path;
    const label = typeof reference === 'string' ? imagePath : reference.label ?? imagePath;
    if (typeof imagePath !== 'string' || !imagePath.startsWith('/images/')) {
      errors.push(`${label ?? 'Image'}: expected a local /images/ path.`);
      continue;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(imagePath.split(/[?#]/, 1)[0]);
    } catch {
      errors.push(`${label}: invalid image path encoding.`);
      continue;
    }
    const target = resolve(projectRoot, 'public', `.${pathname}`);
    const withinImages = relative(imagesRoot, target);
    if (!withinImages || withinImages === '..' || withinImages.startsWith(`..\\`) || withinImages.startsWith('../') || isAbsolute(withinImages)) {
      errors.push(`${label}: image path must stay inside public/images.`);
      continue;
    }
    checkedPaths.push(imagePath);
    if (!existsSync(target) || !statSync(target).isFile()) {
      errors.push(`${label}: missing local image ${imagePath}`);
    }
  }
  return { ok: errors.length === 0, errors, checkedPaths: [...new Set(checkedPaths)] };
}

function runtimeFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'tests' || entry.name === '__tests__' || /\.(?:test|spec)\./i.test(entry.name)) return [];
    const target = join(directory, entry.name);
    if (entry.isDirectory()) return runtimeFiles(target);
    return sourceExtensions.test(entry.name) ? [target] : [];
  });
}

// Catalogue, pet data and direct runtime references are checked together, using Node only.
export async function checkImages({ projectRoot = defaultProjectRoot, additionalPaths = [] } = {}) {
  try {
    const catalogue = await import(pathToFileURL(join(projectRoot, 'src', 'data', 'images.js')).href);
    const pets = JSON.parse(readFileSync(join(projectRoot, 'src', 'data', 'pets.json'), 'utf8'));
    const descriptors = [
      ...Object.values(catalogue.imageAssets ?? {}),
      ...Object.values(catalogue.petImages ?? {}).flatMap(Object.values),
      ...(catalogue.imageCredits ?? []),
      ...(catalogue.fallbackImage ? [catalogue.fallbackImage] : []),
    ];
    const references = descriptors.map((image) => ({ path: image.path, label: `Catalogue ${image.id ?? image.label}` }));
    for (const pet of pets) {
      references.push({ path: pet.image, label: `Pet ${pet.id} portrait` });
      for (const [index, image] of (pet.gallery ?? []).entries()) references.push({ path: image, label: `Pet ${pet.id} gallery ${index + 1}` });
    }
    const files = runtimeFiles(join(projectRoot, 'src'));
    const html = join(projectRoot, 'index.html');
    if (existsSync(html)) files.push(html);
    for (const file of files) {
      // Literal paths only: descriptor-driven and computed paths are covered by the catalogue.
      const content = readFileSync(file, 'utf8');
      const literals = /(["'`])(\/images\/[^"'`\r\n]+)\1|url\(\s*(\/images\/[^)\s]+)\s*\)/g;
      for (const match of content.matchAll(literals)) {
        const imagePath = match[2] ?? match[3];
        if (imagePath.endsWith('/') || imagePath.includes('${')) continue;
        references.push({ path: imagePath, label: relative(projectRoot, file) });
      }
    }
    references.push(...additionalPaths);
    return checkImagePaths(references, { projectRoot });
  } catch (error) {
    return { ok: false, errors: [`Unable to check images: ${error.message}`], checkedPaths: [] };
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const result = await checkImages();
  if (result.ok) console.log(`All ${result.checkedPaths.length} referenced local images exist in public/images.`);
  else {
    console.error(result.errors.join('\n'));
    process.exitCode = 1;
  }
}
