import url from 'url'
import type { IgnorePattern } from './type'

// Ignore Vite dev server
const VITE_REQUEST = [
  '@vite',
  '@react-refresh',
  '__vite_ping',
  '@fs',
  '@id',
  '__x00__',
]

// Ref: https://github.com/vitejs/vite/blob/d156a9f364dddcfc41338f83e39db38a00a2ceb0/packages/vite/src/node/constants.ts#L49
const KNOWN_ASSET_TYPES = [
  // images
  'png',
  'jpe?g',
  'gif',
  'svg',
  'ico',
  'webp',
  'avif',

  // media
  'mp4',
  'webm',
  'ogg',
  'mp3',
  'wav',
  'flac',
  'aac',

  // fonts
  'woff2?',
  'eot',
  'ttf',
  'otf',

  // css
  'css',
  'less',
  'sass',
  'scss',

  // script
  'm?jsx?',
  'tsx?',
  'json',
  'map',

  // other
  'wasm',
  'webmanifest',
  'pdf',
  'txt',
]

const DEFAULT_ASSETS_RE = new RegExp(
  `\\.(` + KNOWN_ASSET_TYPES.join('|') + `)(\\?.*)?$`
)

export const ignorePattern: IgnorePattern = (req) => {
  if (VITE_REQUEST.some((api) => req.url.includes(api))) {
    return true
  }

  const { pathname, query } = url.parse(req.url)
  return DEFAULT_ASSETS_RE.test(pathname) || DEFAULT_ASSETS_RE.test(query)
}
