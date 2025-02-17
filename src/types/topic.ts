export interface Subtopic {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export interface Topic {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export interface SubtopicsMap {
  [key: string]: Subtopic[]
}
