export default interface WorkerRun {
  worker_id: string,
  run_id: string,
  created_ms: number,
  logs: {
    created_ms: number,
    message: string,
  }[],
  state: string
}
