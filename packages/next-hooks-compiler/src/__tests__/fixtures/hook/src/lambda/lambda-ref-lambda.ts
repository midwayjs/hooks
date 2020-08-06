export function hello(name: string, value: string) {}

const hello3 = (name: string) => {}

export function hello2(name: string) {
  hello(name, '1')
  hello3(name)
}
