export interface IRacesResponse {
  page: number
  perPage: number
  totalPages: number
  totalCount: number
  races: IRace[]
}

export interface IRace {
  raceId: string
  quoteId: string
  userId: string
  username: string
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
  match: IMatch
}

export interface IMatch {
  matchId: string
  startTime: string
  players: IPlayer[]
}

export interface IPlayer {
  userId?: string
  username?: string
  raceNumber?: number
  wpm: number
  matchWpm: number
  rawWpm: number
  rawMatchWpm: number
  startTime: number
  accuracy: number
  placement: number
  botId?: string
  guestNumber?: number
  quit?: boolean
  charactersTyped?: number
}

