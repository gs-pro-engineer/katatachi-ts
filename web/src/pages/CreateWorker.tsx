import React  from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import qs from "query-string";
import ApiClient from "../api/ApiClient";
import {
  Button,
  CircularProgress,
  FormControl,
  FormGroup,
  Grid, Input, InputLabel,
  MenuItem,
  Select,
  Typography
} from "@material-ui/core";

type Props = {
  apiClient: ApiClient
} & RouteComponentProps

interface State {
  loading: boolean,
  modules: object[],
  error?: Error,
  moduleName: string,
  argsString: string,
  intervalSeconds: number,
}

class CreateWorker extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const query = qs.parse(this.props.location.search);
    this.state = {
      "loading": true,
      "modules": [],
      "moduleName": query["module_name"] || "",
      "argsString": query["args"] || "{}",
      "intervalSeconds": parseInt(query["interval_seconds"]) || 60,
    };
  }

  componentDidMount() {
    this.props.apiClient.getWorkerModules()
      .then(modules => {
        this.setState({ modules })
      })
      .catch(error => {
        this.setState({ error })
      })
      .finally(() => {
        this.setState({ loading: false })
      })
  }

  onSubmit = () => {
    const {moduleName, argsString, intervalSeconds} = this.state;
    const args = JSON.parse(argsString)
    this.props.apiClient.addWorker(moduleName, args, intervalSeconds)
      .then(() => {
        this.props.history.push("/workers/view");
      })
      .catch(error => {
        this.setState({ error })
      });
  }

  moduleArgsToString = (moduleArgs) => {
    const args = {}
    for (const [argName, argType] of Object.entries(moduleArgs)) {
      let argDefaultValue
      if (argType === "str") {
        argDefaultValue = ""
      } else if (argType === "int") {
        argDefaultValue = -1
      } else if (argType === "bool") {
        argDefaultValue = false
      } else {
        argDefaultValue = null
      }
      args[argName] = argDefaultValue
    }
    return JSON.stringify(args, null, 4)
  }

  render() {
    if (this.state.loading) {
      return (
        <Grid container justify="center">
          <CircularProgress />
        </Grid>
      )
    }
    if (this.state.error) {
      return (
        <Grid container justify="center">
          <Typography variant='body1'>
            Failed to load. Reason: {this.state.error.toString()}
          </Typography>
        </Grid>
      )
    }
    let canParseArgs = true
    try {
      JSON.parse(this.state.argsString)
    } catch {
      canParseArgs = false
    }
    return (
      <FormGroup>
        <FormControl margin='dense'>
          <InputLabel>Module</InputLabel>
          <Select
            value={this.state.moduleName}
            onChange={e => {
              e.preventDefault()
              const moduleName = e.target.value as string
              const argsString = this.moduleArgsToString(
                this.state.modules.filter(m => m['name'] === moduleName)[0]['args']
              )
              this.setState({ moduleName, argsString })
            }}
          >
            {this.state.modules.map((module, i) => {
              return <MenuItem key={i} value={module['name']}>{module['name']}</MenuItem>
            })}
          </Select>
        </FormControl>
        <FormControl margin='dense'>
          <InputLabel>Args</InputLabel>
          <Input
            value={this.state.argsString}
            onChange={e => {
              e.preventDefault()
              this.setState({argsString: e.target.value as string})
            }}
            multiline={true}
            rows={6}
            rowsMax={6}
            error={!canParseArgs}
          />
        </FormControl>
        <FormControl margin='dense'>
          <InputLabel>Interval seconds</InputLabel>
          <Input
            type="number"
            value={this.state.intervalSeconds}
            onChange={e => {
              e.preventDefault()
              this.setState({"intervalSeconds": parseInt(e.target.value)})
            }}
          />
        </FormControl>
        <FormControl margin='dense'>
          <Button
            variant="contained"
            color="secondary"
            onClick={e => {
              e.preventDefault();
              this.onSubmit()
            }}
            disabled={!canParseArgs}
          >Submit</Button>
        </FormControl>
      </FormGroup>
    )
  }
}

export default withRouter(CreateWorker)
