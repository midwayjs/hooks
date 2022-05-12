import detectPort from 'detect-port'
import random from 'lodash/random'

export async function useRandomPort() {
  process.env.MIDWAY_HTTP_PORT = `${await detectPort(random(7000, 8000))}`
}
