"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { Circle, Search, Sparkles, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type SearchRepositoryItem, useSearchState } from "@/components/search-state-provider"
import { fetchRepositories } from "@/lib/github"

const PER_PAGE = 20
const SORT_OPTIONS = [
  { value: "stars-desc", label: "スターが多い順" },
  { value: "stars-asc", label: "スターが少ない順" },
  { value: "forks-desc", label: "フォークが多い順" },
  { value: "forks-asc", label: "フォークが少ない順" },
  { value: "updated-desc", label: "最近更新された順" },
  { value: "updated-asc", label: "更新が古い順" },
]

export default function Page() {
  const {
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
  } = useSearchState()
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState("")
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const didRestoreScroll = useRef(false)

  const shownCount = items.length
  const isLoading = isSearching || isLoadingMore
  const openedRepoKeySet = useMemo(() => new Set(openedRepoKeys), [openedRepoKeys])
  const canLoadMore = useMemo(
    () => hasSearched && !error && shownCount > 0 && shownCount < totalCount,
    [error, hasSearched, shownCount, totalCount]
  )
  const languageOptions = useMemo(() => {
    const base = [{ value: "", label: "すべての言語" }]
    const dynamic = availableLanguages.map((language) => ({ value: language, label: language }))
    if (activeLanguage && !availableLanguages.includes(activeLanguage)) {
      dynamic.unshift({ value: activeLanguage, label: activeLanguage })
    }
    return [...base, ...dynamic]
  }, [activeLanguage, availableLanguages])

  // スクロール位置の復元は初回のみ行い、再描画時の巻き戻りを防ぐ。
  useEffect(() => {
    if (!hasSearched || items.length === 0 || didRestoreScroll.current) {
      return
    }

    didRestoreScroll.current = true
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: "auto" })
    })
  }, [hasSearched, items.length, scrollY])

  useEffect(() => {
    // スクロール位置を共有状態に保存し、詳細ページから戻った際に復元する。
    function handleScroll() {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [setScrollY])

  async function updateRepositories(query: string, nextPage: number, append: boolean) {
    const data = await fetchRepositories(query, nextPage, PER_PAGE, activeLanguage, activeSort)
    const fetchedItems = data.items as SearchRepositoryItem[]

    if (!append && nextPage === 1 && !activeLanguage) {
      const languageCount = new Map<string, number>()
      for (const repo of fetchedItems) {
        if (!repo.language) {
          continue
        }
        languageCount.set(repo.language, (languageCount.get(repo.language) ?? 0) + 1)
      }
      const sortedLanguages = [...languageCount.entries()]
        .sort((a, b) => {
          if (b[1] !== a[1]) {
            return b[1] - a[1]
          }
          return a[0].localeCompare(b[0])
        })
        .map(([language]) => language)
      setAvailableLanguages(sortedLanguages)
    }

    setTotalCount(data.totalCount)
    setPage(nextPage)
    // 追加読み込み時は既存配列の末尾に連結し、初回検索時は結果を置き換える。
    setItems((prev) => (append ? [...prev, ...fetchedItems] : fetchedItems))
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = keyword.trim()

    if (!query) {
      setHasSearched(true)
      setActiveQuery("")
      setAvailableLanguages([])
      setItems([])
      setTotalCount(0)
      setPage(0)
      setScrollY(0)
      setError("キーワードを入力してください。")
      return
    }

    setHasSearched(true)
    setActiveQuery(query)
    setError("")
  }

  async function handleLoadMore() {
    // 二重リクエストと、検索未実行時の誤動作を防ぐ。
    if (!activeQuery || isLoading || !canLoadMore) {
      return
    }

    setError("")
    setIsLoadingMore(true)

    try {
      await updateRepositories(activeQuery, page + 1, true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "リポジトリの取得に失敗しました。")
    } finally {
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    if (!hasSearched || !activeQuery) {
      return
    }

    setError("")
    setIsSearching(true)

    updateRepositories(activeQuery, 1, false)
      .catch((err) => {
        setItems([])
        setTotalCount(0)
        setPage(0)
        setError(err instanceof Error ? err.message : "リポジトリの取得に失敗しました。")
      })
      .finally(() => {
        setIsSearching(false)
      })
  }, [activeLanguage, activeSort, activeQuery, hasSearched, setItems, setPage, setTotalCount])

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-10 px-5 py-10 sm:px-8 sm:py-14">
      <section className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="size-8 text-primary" />
          <h1 className="text-3xl font-semibold tracking-wide text-foreground sm:text-4xl"> GitHubリポジトリ検索</h1>
        </div>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          キーワードを入力し、リポジトリを選択して詳細を確認できます。
        </p>
      </section>

      <Card className="jp-shell gap-4 px-4 py-5 sm:px-8 sm:py-7">
        <form className="mx-auto flex w-full max-w-4xl flex-col gap-3" onSubmit={handleSearch}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              name="keyword"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="例: nextjs, react, spring"
              className="h-11 flex-1 text-[15px]"
              aria-label="リポジトリ検索キーワード"
            />
            <Button type="submit" className="h-11 min-w-28" disabled={isLoading}>
              <Search className="size-4" />
              {isSearching ? "検索中..." : "検索"}
            </Button>
          </div>
          {hasSearched ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                言語フィルター
                <Select value={activeLanguage || "all"} onValueChange={(value) => setActiveLanguage(value === "all" ? "" : value)}>
                  <SelectTrigger aria-label="言語フィルター">
                    <SelectValue placeholder="言語を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value || "all"} value={option.value || "all"}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                並び順
                <Select value={activeSort} onValueChange={setActiveSort}>
                  <SelectTrigger aria-label="並び順">
                    <SelectValue placeholder="並び順を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
          ) : null}
        </form>
      </Card>

      {!hasSearched ? (
        <p className="rounded-lg border border-dashed border-border/85 bg-card/60 p-5 text-center text-sm text-muted-foreground">
          キーワードを入力してリポジトリを検索してください。
        </p>
      ) : null}

      {hasSearched && error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {hasSearched && !error ? (
        <section className="space-y-5">
          <p className="text-sm text-muted-foreground">
            &quot;{activeQuery}&quot; の検索結果: {totalCount.toLocaleString()} 件（表示中{" "}
            {shownCount.toLocaleString()})
            {activeLanguage ? ` / 言語: ${activeLanguage}` : ""} / 並び順:{" "}
            {SORT_OPTIONS.find((option) => option.value === activeSort)?.label ?? "スターが多い順"}
          </p>

          {items.length === 0 ? (
            <p className="rounded-lg border border-border/80 bg-card/70 p-5 text-sm text-muted-foreground">
              {isLoading ? "リポジトリを読み込み中..." : "該当するリポジトリが見つかりませんでした。"}
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((repo) => {
                const repoKey = `${repo.owner.login}/${repo.name}`
                const isOpened = openedRepoKeySet.has(repoKey)

                return (
                  <li key={repo.id}>
                    <Card className="gap-3 py-0 transition duration-250 ease-out hover:-translate-y-px hover:border-primary/35 hover:bg-muted/35">
                      <CardHeader className="px-5 pt-5 pb-0">
                        <CardTitle className="text-base">
                          <div className="flex items-start gap-3">
                            <Image
                              src={repo.owner.avatar_url ?? "https://avatars.githubusercontent.com/u/0?v=4"}
                              alt={`${repo.owner.login} avatar`}
                              width={28}
                              height={28}
                              className="mt-0.5 rounded-full border border-border/70"
                            />
                            <Link
                              href={`/repo/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}`}
                              onClick={() => {
                                setScrollY(window.scrollY)
                                markRepoOpened(repoKey)
                              }}
                              className={`block min-w-0 break-words text-[1.02rem] leading-6 text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline ${isOpened ? "text-primary/80" : ""
                                }`}
                            >
                              {repo.full_name}
                            </Link>
                          </div>
                        </CardTitle>
                        <CardDescription className="line-clamp-2 leading-relaxed">
                          {repo.description ?? "説明はありません"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-5 pb-5">
                        <div className="jp-divider mb-4" />
                        <div className="mb-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Circle className="size-3 text-primary/85" />
                            言語: {repo.language ?? "なし"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Star className="size-3.5 text-[#b23a48]" />
                            スター: {repo.stargazers_count.toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}

          {canLoadMore ? (
            <div className="pt-2">
              <Button className="h-11 w-full" onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? "読み込み中..." : "さらに表示..."}
              </Button>
            </div>
          ) : null}

        </section>
      ) : null}
    </main>
  )
}
