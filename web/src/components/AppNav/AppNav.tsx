import React from 'react'
import {
  Theme,
  createStyles,
  WithStyles,
  withStyles,
  Typography,
  Button,
  Toolbar,
  AppBar as MaterialUiAppBar,
  Box
} from '@material-ui/core'
import AppNavItem from './AppNavItem'


const appBarStyles = (theme: Theme) => createStyles({
  sectionButton: {
    marginLeft: theme.spacing(2)
  }
})

interface AppBarProps extends WithStyles<typeof appBarStyles> {
  title: string,
  subtitle: string,
  items: AppNavItem[],
  rightMostItem?: AppNavItem,
}

const _AppBar = class extends React.Component<AppBarProps, {}> {
  render() {
    const {classes} = this.props;
    return (
      <MaterialUiAppBar position="relative">
        <Toolbar>
          <div style={{
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" color="inherit" noWrap>
              {this.props.title}
            </Typography>
            <Typography variant="caption" display="block" noWrap>
              {this.props.subtitle}
            </Typography>
          </div>
          {this.props.items.map(({text, icon, action}, i) => {
              return (
                <Button
                  key={i}
                  color="inherit"
                  startIcon={icon}
                  className={classes.sectionButton}
                  onClick={e => {
                    e.preventDefault()
                    action()
                  }}
                >{text}</Button>
              )
            }
          )}
          {
            this.props.rightMostItem ?
              <Box flexGrow={1} /> :
              null
          }
          {
            this.props.rightMostItem ?
              <Button color="inherit" onClick={e => {
                e.preventDefault();
                (this.props.rightMostItem as AppNavItem).action()
              }}>
                {(this.props.rightMostItem as AppNavItem).text}
              </Button> :
              null
          }
        </Toolbar>
      </MaterialUiAppBar>
    )
  }
}

const AppBar = withStyles(appBarStyles)(_AppBar)

interface AppNavProps {
  title: string,
  subtitle: string,
  items: AppNavItem[],
  rightMostItem?: AppNavItem,
  children: React.ReactNode
}

class AppNav extends React.Component<AppNavProps, {}> {
  render() {
    return (
      <React.Fragment>
        <AppBar
          title={this.props.title}
          subtitle={this.props.subtitle}
          items={this.props.items}
          rightMostItem={this.props.rightMostItem}
        />
        {this.props.children}
      </React.Fragment>
    )
  }
}

export default AppNav
