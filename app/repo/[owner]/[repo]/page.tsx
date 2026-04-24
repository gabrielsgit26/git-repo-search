import Image from "next/image"
import { notFound } from "next/navigation"
import { Eye, ExternalLink, GitFork, Globe, Star, TriangleAlert } from "lucide-react"

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
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-7 px-5 py-10 sm:px-8 sm:py-14">
      <BackButton />

      <Card className="jp-shell gap-0 py-0">
        <CardHeader className="p-5">
          <CardTitle className="sr-only">{repository.full_name}</CardTitle>
          <CardDescription className="sr-only">
            リポジトリの詳細情報と統計
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-7 p-6 pt-0 sm:p-8 sm:pt-0">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3">
              <Image
                src={repository.owner.avatar_url}
                alt={`${repository.owner.login} avatar`}
                width={50}
                height={50}
                className="rounded-full border border-border/70"
              />
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-wide">
                  {repository.full_name}
                  <a
                    href={repository.html_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHubで開く"
                    className="inline-flex text-primary sm:hidden"
                  >
                    <ExternalLink className="size-5" />
                  </a>
                </h1>
                <p className="text-sm text-muted-foreground">オーナー: {repository.owner.login}</p>
              </div>
            </div>
            <a
              href={repository.html_url}
              target="_blank"
              rel="noreferrer"
              className="hidden w-fit self-start rounded-md border border-border/80 px-4 py-2 text-sm text-primary transition-colors duration-250 hover:bg-muted/70 hover:text-primary/85 sm:inline-flex"
            >
              GitHubで開く
            </a>
          </div>

          <p className="text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
            {repository.description ?? "説明はありません"}
          </p>

          <div className="jp-divider" />

          <div className="grid gap-3 text-sm grid-cols-2">
            <div className="rounded-lg border border-border/70 bg-background/35 p-4">
              <p className="text-muted-foreground flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                使用言語
              </p>
              <p className="mt-1.5 text-base font-medium">{repository.language ?? "なし"}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/35 p-4">
              <p className="text-muted-foreground flex items-center gap-2">
                <Star className="size-4 text-[#b23a48]" />
                スター
              </p>
              <p className="mt-1.5 text-base font-medium">{repository.stargazers_count.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/35 p-4">
              <p className="text-muted-foreground flex items-center gap-2">
                <Eye className="size-4 text-primary" />
                ウォッチャー
              </p>
              <p className="mt-1.5 text-base font-medium">{repository.watchers_count.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/35 p-4">
              <p className="text-muted-foreground flex items-center gap-2">
                <GitFork className="size-4 text-primary" />
                フォーク
              </p>
              <p className="mt-1.5 text-base font-medium">{repository.forks_count.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/35 p-4 col-span-2">
              <p className="text-muted-foreground flex items-center gap-2">
                <TriangleAlert className="size-4 text-[#b23a48]" />
                オープンイシュー
              </p>
              <p className="mt-1.5 text-base font-medium">{repository.open_issues_count.toLocaleString()}</p>
            </div>
            <div className="col-span-2">
              <CloneUrlCopy cloneUrl={repository.clone_url} />
            </div>
          </div>

        </CardContent>
      </Card>
    </main>
  )
}
