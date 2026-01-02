"use client"

import { CodeBlockHighlight } from "./code-block-highlight"

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language = "typescript", className }: CodeBlockProps) {
  return <CodeBlockHighlight code={code} language={language} className={className} />
}

