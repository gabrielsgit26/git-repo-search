"use client"

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"

export type SearchRepositoryItem = {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  owner: {
    login: string
    avatar_url?: string
  }
}

type SearchStateContextValue = {
  keyword: string
  setKeyword: (value: string) => void
  activeQuery: string
  setActiveQuery: (value: string) => void
  activeLanguage: string
  setActiveLanguage: (value: string) => void
  activeSort: string
  setActiveSort: (value: string) => void
  items: SearchRepositoryItem[]
  setItems: Dispatch<SetStateAction<SearchRepositoryItem[]>>
  totalCount: number
  setTotalCount: (value: number) => void
  page: number
  setPage: (value: number) => void
  hasSearched: boolean
  setHasSearched: (value: boolean) => void
  scrollY: number
  setScrollY: (value: number) => void
  openedRepoKeys: string[]
  markRepoOpened: (key: string) => void
}

const SearchStateContext = createContext<SearchStateContextValue | null>(null)

function SearchStateProvider({ children }: { children: ReactNode }) {
  const [keyword, setKeyword] = useState("")
  const [activeQuery, setActiveQuery] = useState("")
  const [activeLanguage, setActiveLanguage] = useState("")
  const [activeSort, setActiveSort] = useState("stars-desc")
  const [items, setItems] = useState<SearchRepositoryItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [openedRepoKeys, setOpenedRepoKeys] = useState<string[]>([])

  function markRepoOpened(key: string) {
    // 既読状態は重複して登録しない。
    setOpenedRepoKeys((prev) => (prev.includes(key) ? prev : [...prev, key]))
  }

  useEffect(() => {
    // スクロール位置をセッション単位で保持し、戻る操作時の体験を安定させる。
    sessionStorage.setItem("repo-search-scroll-y", scrollY.toString())
  }, [scrollY])
  useEffect(() => {
    // 初回表示時のみ、保存済みのスクロール位置を復元する。
    const savedScrollY = sessionStorage.getItem("repo-search-scroll-y")
    if (savedScrollY) {
      setScrollY(Number(savedScrollY))
    }
  }, [])  

  return (
    <SearchStateContext.Provider
      value={{
        keyword,
        setKeyword,
        activeQuery,
        setActiveQuery,
        activeLanguage,
        setActiveLanguage,
        activeSort,
        setActiveSort,
        items,
        setItems,
        totalCount,
        setTotalCount,
        page,
        setPage,
        hasSearched,
        setHasSearched,
        scrollY,
        setScrollY,
        openedRepoKeys,
        markRepoOpened,
      }}
    >
      {children}
    </SearchStateContext.Provider>
  )
}

function useSearchState() {
  const context = useContext(SearchStateContext)
  if (!context) {
    throw new Error("useSearchState must be used inside SearchStateProvider")
  }

  return context
}

export { SearchStateProvider, useSearchState }
