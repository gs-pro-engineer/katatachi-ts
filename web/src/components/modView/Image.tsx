import React, {ImgHTMLAttributes, ReactElement, useState} from "react";
import {Typography} from "@material-ui/core";

interface ImageWithFallbackProps extends ImgHTMLAttributes<any> {
  fallback: ReactElement;
}

const ImageWithFallback = (props: ImageWithFallbackProps) => {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return props.fallback;
  }

  return <img onError={() => {setErrored(true)}} {...props} alt=""/>
}

export interface ImageData {
  url: string;
}

interface Props {
  data: ImageData;
}

const Image: React.FunctionComponent<Props> = (props: Props) => {
  const { data } = props;
  const { url } = data;

  return (
    <ImageWithFallback
      src={url}
      alt=''
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
          <Typography variant="body1">This image failed to load</Typography>
        </div>
      }
    />
  );
};

export default Image;
