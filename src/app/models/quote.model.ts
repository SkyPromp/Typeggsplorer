export interface IQuotesResponse {
  page: number
  perPage: number
  totalPages: number
  totalCount: number
  quotes: IQuote[]
}

export interface IQuote {
  quoteId: string
  source: ISource
  entryId: number
  text: string
  tags: string[]
  language: string
  likes: number
  races: number
  attempts: number
  uniqueUsers: number
  playTime: number
  explicit: boolean
  difficulty: number
  submittedBy: string
  submittedByUsername: string
  ranked: boolean
  created: string
  leaderboard: ILeaderboard[]
}

export interface ISource {
  sourceId: string
  title: string
  author: string
  type: string
  thumbnailUrl: string
  publicationYear: number
}

export interface ILeaderboard {
  raceId: string
  quoteId: string
  userId: string
  username: string
  country: string
  raceNumber: number
  pp: number
  rawPp: number
  wpm: number
  rawWpm: number
  duration: number
  accuracy: number
  errorReactionTime: number
  errorRecoveryTime: number
  timestamp: string
  stickyStart: boolean
  gamemode: string
  keystrokeData: any
}

