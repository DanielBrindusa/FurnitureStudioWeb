export type ValidationSeverity = 'error' | 'warning' | 'info'
export type ValidationState = 'unchecked' | 'valid' | 'warning' | 'error'

export interface ValidationRule {
  id: string
  severity: ValidationSeverity
  code: string
  messageKey: string
  targetObjectId: string
  suggestedFixKey: string
  blocking: boolean
}

export interface ValidationResult extends ValidationRule {
  targetId: string
}

export interface PlacementFeedback {
  valid: boolean
  messageKey: string
}
