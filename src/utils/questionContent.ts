interface RichContent {
  type: 'text' | 'math' | 'code' | 'formula'
  content: string
  style?: {
    fontFamily?: string
    fontSize?: string
    color?: string
    className?: string
  }
  metadata?: {
    description?: string
    label?: string
  }
}

export type QuestionItem = string | RichContent

export function createMathContent(content: string, style?: RichContent['style']): RichContent {
  return {
    type: 'math',
    content,
    style: {
      fontFamily: 'math',
      ...style
    }
  }
}

export function createCodeContent(content: string, style?: RichContent['style']): RichContent {
  return {
    type: 'code',
    content,
    style: {
      fontFamily: 'mono',
      ...style
    }
  }
}

export function createFormulaContent(content: string, style?: RichContent['style']): RichContent {
  return {
    type: 'formula',
    content,
    style: {
      fontFamily: 'math',
      ...style
    }
  }
}

export function createRichContent(
  content: string,
  type: RichContent['type'] = 'text',
  style?: RichContent['style'],
  metadata?: RichContent['metadata']
): RichContent {
  return {
    type,
    content,
    style,
    metadata
  }
}

export function isRichContent(item: QuestionItem): item is RichContent {
  return typeof item !== 'string' && 'type' in item
}
