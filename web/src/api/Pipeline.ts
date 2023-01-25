interface PipelineStateTransition {
  name: string
  from_state: string
  to_states: string[]
}

interface PipelineState {
  name: string,
  count: number
}

export default interface Pipeline {
  pipeline: {
    mod_views: PipelineStateTransition[],
    starting_state: PipelineState,
    states: PipelineState[],
    workers: PipelineStateTransition[],
  },
  sources: string[]
}
