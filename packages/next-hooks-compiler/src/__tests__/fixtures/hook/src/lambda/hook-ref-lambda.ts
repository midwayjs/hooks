export function hello() {
  normal()
}

function normal() {}

function useDemo(name: string) {
  return hello()
}
