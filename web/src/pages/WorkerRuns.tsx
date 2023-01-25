import React, {useEffect} from 'react';
import WorkerRun from "../api/WorkerRun";
import ApiClient from "../api/ApiClient";
import {
  Box,
  Collapse,
  Grid, IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer, TableFooter,
  TableHead,
  TableRow,
  Typography
} from "@material-ui/core";
import {pastTime} from "../utils/timeDelta";
import {KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp} from "@material-ui/icons";

interface Props {
  apiClient: ApiClient
}

const WorkerRunRow = (props: {run: WorkerRun}) => {
  const { run } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>{run.worker_id}</TableCell>
        <TableCell>{run.run_id}</TableCell>
        <TableCell>{run.state}</TableCell>
        <TableCell>{pastTime(run.created_ms)}</TableCell>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <textarea
                value={run.logs.map(ll => {
                  return `${pastTime(ll.created_ms)} ${ll.message}`
                }).join("\n")}
                disabled={true}
                style={{
                  fontFamily: "monospace",
                  resize: 'none',
                  width: '100%',
              }}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

const WorkerRuns = (props: Props) => {
  const [loading, updateLoading] = React.useState(true);
  const [runs, updateRuns] = React.useState<WorkerRun[]>([]);
  const [page, updatePage] = React.useState(1)

  useEffect(() => {
    (async () => {
      const runs = await props.apiClient.getWorkerRuns(page)
      updateRuns(runs)
      updateLoading(false)
    })()
  }, [props.apiClient, page])

  if (loading) {
    return (
      <Grid container justify="center">
        <Typography variant='body1'>
          Loading worker runs...
        </Typography>
      </Grid>
    )
  }

  if (runs.length === 0) {
    return (
      <Grid container justify="center">
        <Typography variant='body1'>
          No worker runs
        </Typography>
      </Grid>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Worker ID</TableCell>
            <TableCell>Run ID</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Created</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {runs.map(run => {
            const uniqueId = `${run.worker_id}.${run.run_id}`;
            return <WorkerRunRow key={uniqueId} run={run} />
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <IconButton
              onClick={() => {
                updatePage(page - 1)
              }}
              disabled={page === 1}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <IconButton
              onClick={() => {
                updatePage(page + 1)
              }}
              disabled={runs.length === 0}
            >
              <KeyboardArrowRight />
            </IconButton>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  )
}

export default WorkerRuns
