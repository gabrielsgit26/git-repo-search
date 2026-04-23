import Image from "next/image"
import { notFound } from "next/navigation"
import { Eye, GitFork, Globe, Star, TriangleAlert } from "lucide-react"

import { BackButton } from "./back-button"
import { CloneUrlCopy } from "./clone-url-copy"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRepositoryDetails } from "@/lib/github"

type PageProps = {
  params: Promise<{
    owner: string
    repo: string
  }>
}

export default async function RepositoryDetailPage({ params }: PageProps) {
  const routeParams = await params
  const owner = decodeURIComponent(routeParams.owner)
  const repo = decodeURIComponent(routeParams.repo)
  const repository = await getRepositoryDetails(owner, repo)

  if (!repository) {
    notFound()
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-6 p-6">
      <BackButton />

      <Card className="gap-0 py-0">
        <CardHeader className="p-5">
          <CardTitle className="sr-only">{repository.full_name}</CardTitle>
          <CardDescription className="sr-only">
            Repository details and statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-5 pt-0">
        <div className="flex items-center gap-3">
          <Image
            src={repository.owner.avatar_url}
            alt={`${repository.owner.login} avatar`}
            width={48}
            height={48}
            className="rounded-full border"
          />
          <div>
            <h1 className="text-xl font-semibold">{repository.full_name}</h1>
            <p className="text-sm text-muted-foreground">オーナー: {repository.owner.login}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {repository.description ?? "説明はありません"}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground flex items-center gap-2">
              <Globe className="size-4" />
              使用言語
            </p>
            <p className="mt-1 font-medium">{repository.language ?? "なし"}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground flex items-center gap-2">
              <Star className="size-4" />
              スター
            </p>
            <p className="mt-1 font-medium">{repository.stargazers_count.toLocaleString()}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground flex items-center gap-2">
              <Eye className="size-4" />
              ウォッチャー
            </p>
            <p className="mt-1 font-medium">{repository.watchers_count.toLocaleString()}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground flex items-center gap-2">
              <GitFork className="size-4" />
              フォーク
            </p>
            <p className="mt-1 font-medium">{repository.forks_count.toLocaleString()}</p>
          </div>
          <div className="rounded-md border p-3 sm:col-span-2">
            <p className="text-muted-foreground flex items-center gap-2">
              <TriangleAlert className="size-4" />
              オープンIssue
            </p>
            <p className="mt-1 font-medium">{repository.open_issues_count.toLocaleString()}</p>
          </div>
          <div className="sm:col-span-2">
            <CloneUrlCopy cloneUrl={repository.clone_url} />
          </div>
        </div>

        <a
          href={repository.html_url}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex text-sm underline-offset-4 hover:underline"
        >
          GitHubで開く
        </a>
        </CardContent>
      </Card>
    </main>
  )
}
