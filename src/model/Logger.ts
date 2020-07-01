/* eslint-disable @typescript-eslint/no-empty-function */
export interface Logger {
  info: (message: string) => void,
  error: (message: string) => void,
}

export const noOpLogger: Logger = {
  info: (message: string) => {},
  error: (message: string) => {},
}

export const consoleLogger: Logger = {
  info: console.log,
  error: console.error,
}
