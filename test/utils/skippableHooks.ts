export function skippableBeforeEach(hook: () => Promise<void>): void {
  beforeEach(async function () {
    if (this.currentTest?.title.includes('skip beforeEach')) {
      return
    }
    await hook()
  })
}
