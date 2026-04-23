"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { type SearchRepositoryItem, useSearchState } from "@/components/search-state-provider"
import { fetchRepositories } from "@/lib/github"

const PER_PAGE = 20

export default function Page() {
  const {
    keyword,
    setKeyword,
    activeQuery,
    setActiveQuery,
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
  const didRestoreScroll = useRef(false)

  const shownCount = items.length
  const isLoading = isSearching || isLoadingMore
  const openedRepoKeySet = useMemo(() => new Set(openedRepoKeys), [openedRepoKeys])
  const canLoadMore = useMemo(
    () => hasSearched && !error && shownCount > 0 && shownCount < totalCount,
    [error, hasSearched, shownCount, totalCount]
  )

  // 一度だけ復元することで、描画のたびにスクロール位置が巻き戻るのを防ぐ。
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
    // スクロール位置は共有状態に保存し、詳細ページから戻った時に復元する。
    function handleScroll() {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [setScrollY])

  async function updateRepositories(query: string, nextPage: number, append: boolean) {
    const data = await fetchRepositories(query, nextPage, PER_PAGE)
    setTotalCount(data.totalCount)
    setPage(nextPage)
    // 追加読み込み時は既存配列の末尾に連結し、初回検索時は置き換える。
    setItems((prev) => (append ? [...prev, ...(data.items as SearchRepositoryItem[])] : (data.items as SearchRepositoryItem[])))
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = keyword.trim()

    if (!query) {
      setHasSearched(true)
      setActiveQuery("")
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
    setIsSearching(true)

    try {
      await updateRepositories(query, 1, false)
    } catch (err) {
      setItems([])
      setTotalCount(0)
      setPage(0)
      setScrollY(0)
      setError(err instanceof Error ? err.message : "リポジトリの取得に失敗しました。")
    } finally {
      setIsSearching(false)
    }
  }

  async function handleLoadMore() {
    // 二重リクエスト防止と、検索未実行時の誤動作防止。
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

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 p-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">GitHubリポジトリ検索</h1>
        <p className="text-sm text-muted-foreground">
          キーワードを入力し、リポジトリを選択して詳細を確認できます。
        </p>
      </section>

      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
        <Input
          name="keyword"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="例: nextjs, react, spring"
          className="h-10"
          aria-label="リポジトリ検索キーワード"
        />
        <Button type="submit" className="h-10 px-4" disabled={isLoading}>
          {isSearching ? "検索中..." : "検索"}
        </Button>
      </form>

      {!hasSearched ? (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          キーワードを入力してリポジトリを検索してください。
        </p>
      ) : null}

      {hasSearched && error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {hasSearched && !error ? (
        <section className="space-y-3">
          <p className="text-sm text-muted-foreground">
            &quot;{activeQuery}&quot; の検索結果: {totalCount.toLocaleString()} 件（表示中{" "}
            {shownCount.toLocaleString()})
          </p>

          {items.length === 0 ? (
            <p className="rounded-md border p-4 text-sm text-muted-foreground">
              {isLoading ? "リポジトリを読み込み中..." : "該当するリポジトリが見つかりませんでした。"}
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((repo) => {
                const repoKey = `${repo.owner.login}/${repo.name}`
                const isOpened = openedRepoKeySet.has(repoKey)

                return (
                  <li key={repo.id}>
                    <Card className="gap-3 py-0 transition-colors hover:bg-muted/40">
                      <CardHeader className="px-4 pt-4 pb-0">
                        <CardTitle className="text-base">
                          <div className="flex items-start gap-3">
                            <Image
                              src={repo.owner.avatar_url ?? "https://avatars.githubusercontent.com/u/0?v=4"}
                              alt={`${repo.owner.login} avatar`}
                              width={28}
                              height={28}
                              className="mt-0.5 rounded-full border"
                            />
                            <Link
                              href={`/repo/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}`}
                              onClick={() => {
                                setScrollY(window.scrollY)
                                markRepoOpened(repoKey)
                              }}
                              className={`block min-w-0 break-words underline-offset-4 hover:underline ${isOpened ? "text-blue-700 dark:text-blue-300" : ""
                                }`}
                            >
                              {repo.full_name}
                            </Link>
                          </div>
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {repo.description ?? "説明はありません"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>言語: {repo.language ?? "なし"}</span>
                          <span>スター: {repo.stargazers_count.toLocaleString()}</span>
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
              <Button  className="w-full" onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? "さらに読み込み中..." : "さらに読み込む"}
              </Button>
            </div>
          ) : null}

        </section>
      ) : null}
    </main>
  )
}
