export const useQuery = (id: string) => {
  return ''
}

export const useInner = async () => {
  useQuery('123')
  const inner = () => {
    console.log(useQuery('123'))
  }
  inner()
}
