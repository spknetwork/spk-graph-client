export class Timer {
  private timeStarted = -1
  constructor() {}

  start() {
    this.timeStarted = new Date().getTime()
  }

  stop(label: string) {
    if (this.timeStarted === -1) {
      throw new Error(`Could not time label ${label}: timer never started!`)
    }

    const ms = new Date().getTime() - this.timeStarted
    console.debug(`Timed "${label}": ${ms} milliseconds elapsed`)
    this.timeStarted = -1
  }
}
