import React from "react";
import {Button, Tooltip, Typography} from "@material-ui/core";
import {OpenInNew, Twitter} from "@material-ui/icons";

const isWww = (str: string): boolean => {
  return str.startsWith("www.")
}

const truncateWww = (hostname: string): string => {
  return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
}

const parseUrl = (str: string): URL | null => {
  try {
    return new URL(str);
  } catch (_) {
    return null;
  }
};

const twitterDomains = ["twitter.com", "mobile.twitter.com", "www.twitter.com"];

const TextMaxLength = 50;

const truncateText = (text: string): string => {
  return text.length > TextMaxLength ? text.slice(0, TextMaxLength) + "..." : text;
}

export interface TextData {
  text: string;
}

interface Props {
  data: TextData;
}

const Text: React.FunctionComponent<Props> = (props: Props) => {
  const { data } = props;
  let { text } = data;
  if (text.startsWith('"') && text.endsWith('"')) {
    // double-quotes on both ends are indication that it's a raw string from mongodb, ignore them
    text = text.substring(1, text.length - 1)
  }

  let maybeHref = text
  if (isWww(text)) {
    maybeHref = `https://${text}`
  }

  const url = parseUrl(maybeHref);
  if (url !== null) {
    if (twitterDomains.includes(url.hostname)) {
      return (
        <Button
          variant="contained"
          color="secondary"
          endIcon={<Twitter />}
          onClick={e => {
            e.preventDefault()
            window.open(url.href, "_blank");
          }}
        >
          Twitter
        </Button>
      );
    } else {
      return (
        <Button
          variant="contained"
          color="secondary"
          endIcon={<OpenInNew />}
          onClick={e => {
            e.preventDefault()
            window.open(url.href, "_blank");
          }}
        >
          {truncateText(truncateWww(url.hostname))}
        </Button>
      );
    }
  } else {
    return (
      <Tooltip title={text}>
        <Typography variant="body1">{truncateText(text)}</Typography>
      </Tooltip>
    );
  }
};

export default Text;
