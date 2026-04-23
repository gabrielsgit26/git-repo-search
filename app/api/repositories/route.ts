import { NextRequest, NextResponse } from "next/server"

const GITHUB_API = "https://api.github.com"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = (searchParams.get("q") ?? "").trim()
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10)
  const perPage = Number.parseInt(searchParams.get("per_page") ?? "20", 10)

  if (!query) {
    return NextResponse.json(
      { totalCount: 0, items: [], error: "クエリパラメータ q は必須です。" },
      { status: 400 }
    )
  }

  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePerPage = Number.isFinite(perPage) ? Math.min(20, Math.max(10, perPage)) : 20

  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&page=${safePage}&per_page=${safePerPage}`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { totalCount: 0, items: [], error: "GitHub検索に失敗しました。しばらくして再度お試しください。" },
        { status: response.status }
      )
    }

    const data = (await response.json()) as {
      total_count?: number
      items?: unknown[]
    }

    return NextResponse.json({
      totalCount: data.total_count ?? 0,
      items: data.items ?? [],
    })
  } catch {
    return NextResponse.json(
      { totalCount: 0, items: [], error: "リポジトリ検索中にネットワークエラーが発生しました。" },
      { status: 500 }
    )
  }
}
