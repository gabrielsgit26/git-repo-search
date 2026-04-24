"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

type CloneUrlCopyProps = {
  cloneUrl: string
}

export function CloneUrlCopy({ cloneUrl }: CloneUrlCopyProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      // コピー成功時は、短時間だけ完了アイコンを表示して状態を伝える。
      await navigator.clipboard.writeText(cloneUrl)
      setCopied(true)
      window.setTimeout(() => {
        setCopied(false)
      }, 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="rounded-lg border border-border/70 bg-background/35 p-4">
      <p className="text-muted-foreground text-sm">クローンURL</p>
      <div className="mt-2 flex items-center gap-2">
        <code className="bg-muted/65 block flex-1 rounded-md px-3 py-2 text-xs break-all">{cloneUrl}</code>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={handleCopy}
          aria-label="クローンURLをコピー"
          title="クローンURLをコピー"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
    </div>
  )
}
