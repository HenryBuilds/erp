import { codeToHtml } from 'shiki'

const themes = {
  light: 'github-light',
  dark: 'github-dark',
} as const

export async function highlightCode(code: string, language: string = 'typescript', theme: 'light' | 'dark' = 'light') {
  return await codeToHtml(code, {
    lang: language,
    theme: themes[theme],
  })
}

