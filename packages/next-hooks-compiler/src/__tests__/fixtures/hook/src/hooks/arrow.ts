export const useDemo = (name: string) => {}

export const useArrow = (name: string) => {
  useDemo(name + '666')
}

export const useAsyncArrow = async (name: string) => {
  await useDemo(name + '666')
}
