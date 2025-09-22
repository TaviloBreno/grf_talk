/**
 * Polling Manager - Handles intelligent polling with rate limiting and backoff
 */

interface PollingConfig {
  baseInterval: number
  maxInterval: number
  backoffMultiplier: number
  maxRetries: number
}

interface PollingState {
  interval: number
  consecutiveErrors: number
  lastPollTime: number
  isPolling: boolean
}

export class PollingManager {
  private config: PollingConfig
  private state: PollingState
  private intervalRef: NodeJS.Timeout | null = null
  private abortController: AbortController | null = null
  private currentPollFunction: (() => Promise<void>) | null = null

  constructor(config: Partial<PollingConfig> = {}) {
    this.config = {
      baseInterval: 3000, // 3 seconds
      maxInterval: 30000, // 30 seconds
      backoffMultiplier: 1.5,
      maxRetries: 5,
      ...config
    }

    this.state = {
      interval: this.config.baseInterval,
      consecutiveErrors: 0,
      lastPollTime: 0,
      isPolling: false
    }
  }

  async startPolling(pollFunction: () => Promise<void>) {
    this.stopPolling()
    this.currentPollFunction = pollFunction
    
    const poll = async () => {
      const now = Date.now()
      
      // Prevent concurrent polls
      if (this.state.isPolling) {
        console.log('Poll already in progress, skipping...')
        return
      }

      // Rate limiting - ensure minimum time between polls
      const timeSinceLastPoll = now - this.state.lastPollTime
      if (timeSinceLastPoll < 1000) { // Minimum 1 second between polls
        return
      }

      this.state.isPolling = true
      this.state.lastPollTime = now

      try {
        await pollFunction()
        
        // Success - reset error count and interval
        if (this.state.consecutiveErrors > 0) {
          this.state.consecutiveErrors = 0
          this.state.interval = this.config.baseInterval
          this.reschedule()
        }
      } catch (error) {
        console.error('Polling error:', error)
        this.handleError()
      } finally {
        this.state.isPolling = false
      }
    }

    // Initial poll
    await poll()
    
    // Schedule subsequent polls
    this.schedule(poll)
  }

  private handleError() {
    this.state.consecutiveErrors++
    
    if (this.state.consecutiveErrors >= this.config.maxRetries) {
      console.log('Too many consecutive errors, stopping polling temporarily')
      this.stopPolling()
      
      // Restart after delay
      setTimeout(() => {
        this.state.consecutiveErrors = 0
        this.state.interval = this.config.baseInterval
      }, 30000)
      return
    }

    // Exponential backoff
    this.state.interval = Math.min(
      this.state.interval * this.config.backoffMultiplier,
      this.config.maxInterval
    )
    
    this.reschedule()
  }

  private schedule(pollFunction: () => Promise<void>) {
    this.intervalRef = setInterval(pollFunction, this.state.interval)
  }

  private reschedule() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef)
      this.intervalRef = null
    }
    
    if (this.currentPollFunction) {
      // Start new interval with updated timing
      this.schedule(async () => {
        if (this.currentPollFunction) {
          await this.currentPollFunction()
        }
      })
    }
  }

  stopPolling() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef)
      this.intervalRef = null
    }
    
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  // Adjust polling based on page visibility
  setActiveState(isActive: boolean) {
    if (!isActive) {
      // Slower polling when page is hidden
      this.state.interval = Math.max(this.state.interval, 30000)
    } else {
      // Resume normal polling when page is visible
      this.state.interval = this.config.baseInterval
    }
    this.reschedule()
  }

  getCurrentInterval(): number {
    return this.state.interval
  }

  getState(): Readonly<PollingState> {
    return { ...this.state }
  }
}