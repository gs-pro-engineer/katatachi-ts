import React  from "react"
import { withRouter, RouteComponentProps } from "react-router-dom";
import {Button, FormControl, FormGroup, Input, InputLabel, Typography} from "@material-ui/core";

type Props = RouteComponentProps

interface State {
  loading: boolean
  error?: Error
  metadataStr: string,
  args: object,
}

class Worker extends React.Component<Props, State> {
  private readonly workerId: string;

  constructor(props) {
    super(props);
    this.workerId = this.props.match.params.workerId as string;
    this.state = {
      "loading": true,
      "metadataStr": "[]",
      "args": {},
    }
  }

  componentDidMount() {
    Promise.all([
      this.props.apiClient.getWorkerMetadata(this.workerId),
      this.props.apiClient.getWorkerArgs(this.workerId),
    ])
      .then(([metadata, args]) => {
        this.setState({
          "metadataStr": JSON.stringify(metadata),
          args,
        })
      })
      .catch(error => {
        this.setState({ error })
      })
      .finally(() => {
        this.setState({
          "loading": false
        })
      })
  }

  render() {
    let canParseMetadata = true
    try {
      JSON.parse(this.state.metadataStr)
    } catch {
      canParseMetadata = false
    }
    return (
      <div>
        <Typography>{`Worker ${this.workerId}`}</Typography>
        <FormGroup>
          <FormControl margin='dense'>
            <InputLabel>Args</InputLabel>
            <Input
              multiline
              rows={10}
              rowsMax={10}
              value={JSON.stringify(this.state.args, null ,4)}
              disabled={true}
              style={{fontFamily: "monospace"}}
            />
          </FormControl>
          <FormControl margin='dense'>
            <InputLabel>Metadata</InputLabel>
            <Input
              multiline
              rows={5}
              rowsMax={5}
              value={this.state.metadataStr}
              onChange={e => {
                e.preventDefault()
                this.setState({"metadataStr": e.target.value})}
              }
              error={!canParseMetadata}
              style={{fontFamily: "monospace"}}
            />
          </FormControl>
          <FormControl margin='dense'>
            <Button
              variant="contained"
              color="secondary"
              onClick={e => {
                e.preventDefault()
                this.props.apiClient.setWorkerMetadata(this.workerId, JSON.parse(this.state.metadataStr))
              }}
              disabled={!canParseMetadata}
            >Submit</Button>
          </FormControl>
        </FormGroup>
      </div>
    )
  }
}

export default withRouter(Worker)
