import React from 'react';
import { Route, Switch, Redirect, withRouter, RouteComponentProps } from "react-router-dom"
import { MuiThemeProvider, Container, createStyles, withStyles, createMuiTheme, CssBaseline } from "@material-ui/core";

import PrivateRoute from "./components/PrivateRoute";
import Workers from "./pages/Workers"
import CreateWorker from "./pages/CreateWorker"
import ModViews from "./pages/ModViews"
import ModView from "./pages/ModView"
import Worker from "./pages/Worker"
import ApiClient from "./api/ApiClient";
import Login from "./pages/Login";
import Pipeline from "./pages/Pipeline";

import DashboardIcon from '@material-ui/icons/Dashboard';
import AlarmIcon from '@material-ui/icons/Alarm';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import WorkerRuns from "./pages/WorkerRuns";
import AppNav from "./components/AppNav/AppNav";

const styles = (theme) => createStyles({
  main: {
    // top and bottom padding's
    padding: theme.spacing(4, 0, 3),
  }
});

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#ff6434',
      main: '#dd2c00',
      dark: '#a30000',
      contrastText: '#ffffff'
    },
    secondary: {
      light: '#5e91f2',
      main: '#1564bf',
      dark: '#003b8e',
      contrastText: '#ffffff'
    }
  }
});

type Props = RouteComponentProps

interface State {
  version?: string
}

class App extends React.Component<Props, State> {
  private readonly apiClient: ApiClient

  constructor(props) {
    super(props);
    this.apiClient = new ApiClient()
    this.state = {
      version: undefined
    }
  }

  componentDidMount() {
    this.apiClient.getVersion()
      .then(version => this.setState({ version }))
      .catch(err => console.error(err))
  }

  render() {
    const {classes} = this.props;

    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline/>
        <AppNav
          title={document.title}
          subtitle={`Katatachi v${this.state.version || '...'}`}
          items={[
            {
              text: 'Mod Views',
              icon: <DashboardIcon />,
              action: () => {
                this.props.history.push("/modViews/view")
              }
            },
            {
              text: 'Workers',
              icon: <AlarmIcon />,
              action: () => {
                this.props.history.push("/workers/view")
              }
            },
            {
              text: 'Runs',
              icon: <PlayArrowIcon />,
              action: () => {
                this.props.history.push("/workers/runs/view")
              }
            },
            {
              text: 'Pipeline',
              icon: <AccountTreeIcon />,
              action: () => {
                this.props.history.push("/pipeline/view")
              }
            },
          ]}
          rightMostItem={{
            text: "Logout",
            icon: null,
            action: () => {
              this.apiClient.unsetAuth();
              window.location.reload()
            }
          }}
        >
          <Container>
            <main className={classes.main}>
              <Switch>
                <Redirect
                  exact
                  from="/"
                  to="/modViews/view"
                />
                <Route
                  exact
                  path='/login'
                  component={() => {
                    return (<Login apiClient={this.apiClient}/>)
                  }}
                />
                <PrivateRoute
                  path="/pipeline/view"
                  apiClient={this.apiClient}
                  render={() => {
                    return (<Pipeline apiClient={this.apiClient}/>)
                  }}
                />
                <PrivateRoute
                  path="/modViews/view"
                  apiClient={this.apiClient}
                  render={() => {
                    return (<ModViews apiClient={this.apiClient}/>)
                  }}
                />
                <Route
                  path="/modView/:name"
                  apiClient={this.apiClient}
                  component={() => {
                    return (<ModView apiClient={this.apiClient}/>)
                  }}
                />
                <Route
                  path="/workers/view"
                  apiClient={this.apiClient}
                  component={() => {
                    return (<Workers apiClient={this.apiClient} />)
                  }}
                />
                <Route
                  path="/workers/create"
                  apiClient={this.apiClient}
                  component={() => {
                    return (<CreateWorker apiClient={this.apiClient}/>)
                  }}
                />
                <Route
                  path="/worker/:workerId"
                  apiClient={this.apiClient}
                  component={() => {
                    return (<Worker apiClient={this.apiClient}/>)
                  }}
                />
                <Route
                  path="/workers/runs/view"
                  apiClient={this.apiClient}
                  component={() => {
                    return (<WorkerRuns apiClient={this.apiClient}/>)
                  }}
                />
              </Switch>
            </main>
          </Container>
        </AppNav>
      </MuiThemeProvider>
    );
  }
}

export default withRouter(withStyles(styles)(App));
