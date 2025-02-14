'use client'
import { QuestionItem, isRichContent } from '@/utils/questionContent'

interface Props {
  content: QuestionItem
  className?: string
}

export default function RichContent({ content, className = '' }: Props) {
  if (!isRichContent(content)) {
    return <span className={className}>{content}</span>
  }

  const { type, style = {}, metadata } = content
  const combinedClassName = `${style.className || ''} ${className}`.trim()

  const inlineStyle = {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    color: style.color
  }

  switch (type) {
    case 'math':
      return (
        <span 
          className={`font-math ${combinedClassName}`}
          style={inlineStyle}
          title={metadata?.description}
        >
          {content.content}
        </span>
      )

    case 'code':
      return (
        <code 
          className={`font-mono ${combinedClassName}`}
          style={inlineStyle}
          title={metadata?.description}
        >
          {content.content}
        </code>
      )

    case 'formula':
      return (
        <span 
          className={`font-math ${combinedClassName}`}
          style={inlineStyle}
          title={metadata?.description}
        >
          {content.content}
        </span>
      )

    default:
      return (
        <span 
          className={combinedClassName}
          style={inlineStyle}
          title={metadata?.description}
        >
          {content.content}
        </span>
      )
  }
}
