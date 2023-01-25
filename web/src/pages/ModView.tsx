import React, {useEffect} from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import BoardRender, {RenderDataTypes, RenderTypes, Row} from "../api/BoardRender";
import Button from "../components/modView/Button";
import Image from "../components/modView/Image";
import ImageList from "../components/modView/ImageList";
import Text from "../components/modView/Text";
import Video from "../components/modView/Video";
import {
  CircularProgress,
  Grid,
  Paper, Snackbar,
  Table,
  TableBody, TableCell,
  TableContainer,
  TableHead, TableRow,
  Typography,
} from "@material-ui/core";
import {awaitTimeout} from "../utils/awaitTimeout";

const SnackbarWait = 1000;

type Props = RouteComponentProps<{
  name: string;
}>;

const ModView = (props: Props) => {
  const boardId = decodeURIComponent(props.match.params.name);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [boardRender, setBoardRender] = React.useState<BoardRender | undefined>(undefined);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string | undefined>(undefined);
  const [callbackDisabled, setCallbackDisabled] = React.useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setError(undefined);
    setBoardRender(undefined);
    setSnackbarMessage(undefined);
    setCallbackDisabled(false);
    props.apiClient.renderBoard(boardId)
      .then(boardRender => setBoardRender(boardRender))
      .catch(error => {
        setError(error);
      })
      .finally(() => {
        setLoading(false)
      });
  }, [props.apiClient, boardId]);

  if (loading) {
    return (
      <Grid container justify="center">
        <CircularProgress />
      </Grid>
    )
  }
  if (error) {
    return (
      <Grid container justify="center">
        <Typography variant='body1'>
          Failed to load. Reason: {error.toString()}
        </Typography>
      </Grid>
    )
  }
  if (boardRender === undefined) {
    return (
      <Grid container justify="center">
        <Typography variant='body1'>
          Failed to load. Please retry.
        </Typography>
      </Grid>
    )
  }

  const renderCell = (
    type: RenderTypes,
    data: RenderDataTypes,
    rawDocument?: object,
    callbackId?: string,
    getRawDocument?: () => object[],
  ) => {
    let ColumnComponent;
    if (type === "text") {
      ColumnComponent = Text;
    } else if (type === "image") {
      ColumnComponent = Image;
    } else if (type === "image_list") {
      ColumnComponent = ImageList;
    } else if (type === "button") {
      ColumnComponent = Button;
    } else if (type === "video") {
      ColumnComponent = Video;
    }
    if (!ColumnComponent) {
      return <Typography>{`Unknown column type ${type}`}</Typography>;
    }
    return (
      <ColumnComponent
        data={data}
        boardId={boardId}
        callbackId={callbackId}
        rawDocument={rawDocument}
        getRawDocument={getRawDocument}
        apiClient={props.apiClient}
        reloading={() => {
          setLoading(true)
        }}
        reload={(boardRender) => {
          setBoardRender(boardRender)
        }}
        reloadFinished={() => {
          setLoading(false)
        }}
        remove={() => {
          if (!rawDocument) {
            return
          }
          if (Object.keys(boardRender).length === 0) {
            return
          }
          setBoardRender(
            {
              ...boardRender,
              count: boardRender.count - 1,
              payload: boardRender.payload.filter(row => {
                return JSON.stringify(row.raw_document) !== JSON.stringify(rawDocument)
              })
            }
          )
        }}
        rowCount={boardRender.payload.length}
        onCallbackError={async e => {
          setCallbackDisabled(true)
          setSnackbarMessage(`Something went wrong while making board callback: ${e.toString()}. Reloading...`)
          await awaitTimeout(SnackbarWait);
          window.location.reload()
        }}
        disabled={callbackDisabled}
      />
    )
  }

  const renderRow = (projectionNames: string[], row: Row) => {
    const rowRenders = row.renders;
    return (
      <TableRow key={JSON.stringify(row.raw_document)}>
        {projectionNames.map(name => {
          const rowRender = rowRenders[name];
          let cell;
          if (!rowRender) {
            cell = (<Typography>N/A</Typography>);
          } else {
            cell = renderCell(
              rowRender.type,
              rowRender.data,
              row.raw_document,
              rowRender.callback_id,
            );
          }
          return (
            <TableCell
              key={name}
            >{cell}</TableCell>
          );
        })}
      </TableRow>
    );
  }

  const renderPayload = () => {
    const {payload} = boardRender;
    if (!payload || payload.length === 0) {
      return (
        <Typography>Query is empty</Typography>
      );
    }
    const projectionNames = boardRender.board_query.projections.map((p) => p.name);
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {projectionNames.map(name =>
                <TableCell
                  key={name}
                >{name}</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {payload.map(row => {
              return renderRow(projectionNames, row);
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  const rows = boardRender.payload.length;
  return (
    <React.Fragment>
      <Typography gutterBottom>
        Mod view "{boardId}" ({boardRender.count}
        {boardRender.count !== rows ? `, showing ${rows}` : ""})
      </Typography>
      {renderPayload()}
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={snackbarMessage !== undefined}
        autoHideDuration={SnackbarWait}
        onClose={() => {setSnackbarMessage(undefined)}}
        message={snackbarMessage}
      />
    </React.Fragment>
  );

}

export default withRouter(ModView);
