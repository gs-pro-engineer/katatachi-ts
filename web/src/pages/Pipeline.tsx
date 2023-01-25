import React, {useEffect, useState} from "react"
import ApiClient from "../api/ApiClient";
import Pipeline from "../api/Pipeline";
import {Grid, Typography} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import ReactFlow, {ArrowHeadType, Elements, isNode, isEdge, Position} from 'react-flow-renderer';
import dagre from 'dagre';

const nonPositioned = { x: 0, y: 0 }

const pipelineToReactFlowElements = ({ pipeline, sources }: Pipeline): Elements => {
  // sources as one node
  const elements: Elements = [
    {
      id: "PipelineSources",
      data: {
        label: `Sources (${sources.length})`,
        name: "PipelineSources"
      },
      position: nonPositioned,
    }
  ]

  // states as nodes
  for (let state of pipeline.states) {
    elements.push({
      id: state.name,
      data: { label: `${state.name} (${state.count})` },
      position: nonPositioned,
    })
  }

  // sources one node -> starting state as edges
  elements.push({
    id: `PipelineSources-${pipeline.starting_state.name}`,
    source: "PipelineSources",
    target: pipeline.starting_state.name,
    animated: true,
    arrowHeadType: ArrowHeadType.ArrowClosed
  })

  // workers and mod views as edges
  const stateTransitionsWithType = [
    ...pipeline.workers.map(t => ({...t, type: 'w'})),
    ...pipeline.mod_views.map(t => ({...t, type: 'm'}))
  ]
  for (let stateTransition of stateTransitionsWithType) {
    const fromState = stateTransition.from_state
    for (let toState of stateTransition.to_states) {
      const { name, type } = stateTransition
      elements.push({
        id: `${fromState}-${toState}`,
        data: { fromState, toState, name, type },
        label: `(${type}) ${name}`,
        source: fromState,
        target: toState,
        animated: true,
        arrowHeadType: ArrowHeadType.ArrowClosed
      })
    }
  }

  return elements
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 200;
const nodeHeight = 50;

const positionReactFlowElementsHorizontally = (elements: Elements): Elements => {
  dagreGraph.setGraph({ rankdir: "LR" });

  elements.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });

  dagre.layout(dagreGraph);

  return elements.map((el) => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id);
      el.targetPosition = Position.Left;
      el.sourcePosition = Position.Right;

      // unfortunately we need this little hack to pass a slightly different position
      // to notify react flow about the change. Moreover we are shifting the dagre node position
      // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
      el.position = {
        x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    }

    return el;
  });
}

interface Props {
  apiClient: ApiClient
}

const PipelinePage = (props: Props) => {
  const [loading, updateLoading] = useState(true)
  const [pipeline, updatePipeline] = useState<Pipeline | undefined>()
  const history = useHistory()

  useEffect(() => {
    (async () => {
      const pipeline = await props.apiClient.getPipeline()
      updatePipeline(pipeline)
      updateLoading(false)
    })()
  }, [props.apiClient])

  if (loading) {
    return (
      <Grid container justify="center">
        <Typography variant='body1'>
          Loading pipeline...
        </Typography>
      </Grid>
    )
  }

  if (!pipeline) {
    return (
      <Grid container justify="center">
        <Typography variant='body1'>
          No pipeline
        </Typography>
      </Grid>
    )
  }

  const elements = pipelineToReactFlowElements(pipeline)
  const positionedElements = positionReactFlowElementsHorizontally(elements)
  return (
    <div style={{ height: 500, width: 1200 }}>
      <ReactFlow
        elements={positionedElements}
        nodesDraggable={false}
        nodesConnectable={false}
        onElementClick={(event, element) => {
          if (isEdge(element) && element.data.type === 'm') {
              const { data } = element
              history.push(`/modView/${data.name}`)
          }
        }}
      />
    </div>
  )
}

export default PipelinePage
