import { en } from './en'
import { ro } from './ro'
import type { LanguageCode } from '../models/design'

export type TranslationKey = keyof typeof en

const dictionaries: Record<LanguageCode, Record<TranslationKey, string>> = {
  en,
  ro,
}

export function translate(language: LanguageCode, key: string): string {
  const dictionary = dictionaries[language] as Record<string, string>
  return dictionary[key] ?? (en as Record<string, string>)[key] ?? key
}

export { en, ro }
