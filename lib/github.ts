export type RepositorySearchItem = {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  owner: {
    login: string
    avatar_url: string
  }
}

export type RepositoryDetails = {
  id: number
  name: string
  full_name: string
  html_url: string
  clone_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  owner: {
    login: string
    avatar_url: string
  }
}

export type RepositorySearchResponse = {
  totalCount: number
  items: RepositorySearchItem[]
  error?: string
}

const GITHUB_API = "https://api.github.com"

export async function fetchRepositories(
  query: string,
  page: number,
  perPage = 20,
  language = "",
  sort = "stars-desc"
): Promise<RepositorySearchResponse> {
  const languageParam = language.trim()
  const sortParam = sort.trim() || "stars-desc"
  const response = await fetch(
    `/api/repositories?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&language=${encodeURIComponent(languageParam)}&sort=${encodeURIComponent(sortParam)}`
  )
  const data = (await response.json()) as RepositorySearchResponse

  if (!response.ok || data.error) {
    throw new Error(data.error ?? "リポジトリの取得に失敗しました。")
  }

  return data
}

export async function getRepositoryDetails(
  owner: string,
  repo: string
): Promise<RepositoryDetails | null> {
  try {
    const url = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as RepositoryDetails
  } catch {
    return null
  }
}
