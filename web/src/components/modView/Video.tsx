import React, {ReactElement, useState, VideoHTMLAttributes} from "react";
import {Typography} from "@material-ui/core";

interface VideoWithFallbackProps extends VideoHTMLAttributes<any> {
  fallback: ReactElement;
}

const VideoWithFallback = (props: VideoWithFallbackProps) => {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return props.fallback;
  }

  return <video onError={() => {setErrored(true)}} {...props}/>
}

export interface VideoData {
  url: string;
}

interface Props {
  data: VideoData;
}

const Video: React.FunctionComponent<Props> = (props: Props) => {
  const { data } = props;
  const { url } = data;

  return (
    <VideoWithFallback
      controls
      style={{
        objectFit: "contain",
        width: 360,
        height: 480,
      }}
      fallback={
        <div style={{
          width: 360,
          height: 480,
          textAlign: "center"
        }}>
          <Typography variant="body1">This video failed to load</Typography>
        </div>
      }
    >
      <source src={url} type="video/mp4"/>
    </VideoWithFallback>
  );
};

export default Video;
