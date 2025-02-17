export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export function createShuffledPairs<T>(items: T[], connections: Array<{from: number, to: number}>): {
  shuffledItems: T[],
  shuffledConnections: Array<{from: number, to: number}>
} {
  // Create a mapping of original indices to shuffled indices
  const indices = Array.from({ length: items.length }, (_, i) => i)
  const shuffledIndices = shuffleArray(indices)
  
  // Create a mapping from original to shuffled indices
  const indexMap = new Map(indices.map((originalIndex, i) => [originalIndex, shuffledIndices[i]]))
  
  // Shuffle the items using the mapping
  const shuffledItems = items.map((_, i) => items[shuffledIndices.indexOf(i)])
  
  // Update the connections to use the new indices
  const shuffledConnections = connections.map(conn => ({
    from: conn.from,
    to: indexMap.get(conn.to)!
  }))
  
  return { shuffledItems, shuffledConnections }
}
