export function useQuery(id: string) {
  return ''
}

export async function useInner() {
  useQuery('123')
  const inner = () => {
    console.log(useQuery('123'))
  }
  inner()
}
