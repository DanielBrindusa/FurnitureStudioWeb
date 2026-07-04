import { Component, type ErrorInfo, type ReactNode } from 'react'
import { translate } from '../i18n'
import type { LanguageCode } from '../models/design'

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The normal UI intentionally avoids exposing stack details to users.
  }

  render() {
    if (!this.state.failed) return this.props.children
    const language: LanguageCode = navigator.language.toLowerCase().startsWith('ro') ? 'ro' : 'en'
    const t = (key: string) => translate(language, key)
    return <main className="app-fallback"><span aria-hidden="true">FSW</span><h1>{t('errorBoundary.title')}</h1><p>{t('errorBoundary.message')}</p><div><button type="button" className="primary-button" onClick={() => window.location.reload()}>{t('button.reload')}</button><button type="button" onClick={() => { try { localStorage.removeItem('furniture-studio:draft:v1') } finally { window.location.reload() } }}>{t('button.clearDraft')}</button></div></main>
  }
}
