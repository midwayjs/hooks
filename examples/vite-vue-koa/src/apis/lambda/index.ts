export default async () => {
  return 'hello world'
}

export const get = () => {
  return 'get'
}

export const post = (name: string) => {
  return 'post' + name
}

export async function bar() {}
