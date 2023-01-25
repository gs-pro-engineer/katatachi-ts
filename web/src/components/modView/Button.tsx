import React from "react";
import ApiClient from "../../api/ApiClient";
import { Button as MuiButton } from "@material-ui/core"

type ButtonAfterCallback = 'reload' | 'remove' | 'nothing'

export interface ButtonData {
  text: string;
  after_callback: ButtonAfterCallback;
}

interface Props {
  data: ButtonData;
  boardId: string;
  callbackId: string;
  rawDocument?: object;
  getRawDocument?: () => object[];
  apiClient: ApiClient;
  reloading: () => void;
  reload: (BoardRender) => void;
  reloadFinished: () => void;
  remove: () => void;
  rowCount: number;
  onCallbackError: (Error) => void;
  disabled?: boolean;
}

const Button: React.FunctionComponent<Props> = (props: Props) => {
  const { data, boardId, callbackId, rawDocument, apiClient, reloading, reload, reloadFinished, getRawDocument, remove,
    rowCount } = props;
  if (rawDocument === undefined && getRawDocument === undefined) {
    return <div>Neither rawDocument nor getRawDocument</div>;
  }
  const { text, after_callback } = data;
  return (
    <MuiButton
      variant="contained"
      color="secondary"
      onClick={() => {
        let rawDocuments: object[];
        if (getRawDocument !== undefined) {
          rawDocuments = (getRawDocument as () => object[])();
        } else {
          rawDocuments = [(rawDocument as object)];
        }

        let afterCallback = after_callback
        if (afterCallback === "remove" && rowCount === 1) {
          afterCallback = "reload"
        }

        if (afterCallback === "reload") {
          reloading()
        } else if (afterCallback === "remove") {
          remove()
        }
        Promise.all(rawDocuments.map((d) =>
          apiClient.callbackBoard(boardId, callbackId, d),
        ))
          .then(responses => {
            if (afterCallback === "reload") {
              // @ts-ignore
              const boardRenders = responses.map(r => r.data)
              reload(boardRenders[boardRenders.length - 1])
            }
          })
          .catch(props.onCallbackError)
          .finally(() => {
            if (afterCallback === "reload") {
              reloadFinished()
            }
          })
      }}
      disabled={props.disabled}
    >
      {text}
    </MuiButton>
  );
};

export default Button;
