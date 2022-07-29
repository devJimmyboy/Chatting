import { List } from '@mantine/core'

interface SearchProps {}

export default function SearchView({}: SearchProps) {
  return (
    <List.Item className="flex flex-row h-4 rounded-md font-bold w-full">
      <span></span>
      <span className="ml-2 font-normal"></span>
    </List.Item>
  )
}
