"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

export function BackButton() {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push("/")
  }

  return (
    <Button variant="ghost" className="w-fit" onClick={handleBack}>
      ← 検索結果に戻る
    </Button>
  )
}
