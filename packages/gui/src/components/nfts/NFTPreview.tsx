import React, {
  useMemo,
  useState,
  useRef,
  type ReactNode,
  Fragment,
  useEffect,
} from 'react';
import { renderToString } from 'react-dom/server';
import mime from 'mime-types';
import { t, Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { NotInterested, Error as ErrorIcon } from '@mui/icons-material';

import {
  IconMessage,
  Loading,
  Flex,
  SandboxedIframe,
  usePersistState,
  useDarkMode,
} from '@chia/core';
import styled from 'styled-components';
import { type NFTInfo } from '@chia/api';
import isURL from 'validator/lib/isURL';
import useNFTHash from '../../hooks/useNFTHash';
import AudioSvg from '../../assets/img/audio.svg';
import AudioPngIcon from '../../assets/img/audio.png';
import UnknownPngIcon from '../../assets/img/unknown.png';
import DocumentPngIcon from '../../assets/img/document.png';
import VideoPngIcon from '../../assets/img/video.png';
import ModelPngIcon from '../../assets/img/model.png';
import AudioPngDarkIcon from '../../assets/img/audio_dark.png';
import UnknownPngDarkIcon from '../../assets/img/unknown_dark.png';
import DocumentPngDarkIcon from '../../assets/img/document_dark.png';
import VideoPngDarkIcon from '../../assets/img/video_dark.png';
import ModelPngDarkIcon from '../../assets/img/model_dark.png';

import VideoBlobIcon from '../../assets/img/video-blob.svg';
import AudioBlobIcon from '../../assets/img/audio-blob.svg';
import ModelBlobIcon from '../../assets/img/model-blob.svg';
import UnknownBlobIcon from '../../assets/img/unknown-blob.svg';
import DocumentBlobIcon from '../../assets/img/document-blob.svg';

import CompactIconSvg from '../../assets/img/nft-small-frame.svg';

import VideoSmallIcon from '../../assets/img/video-small.svg';
import AudioSmallIcon from '../../assets/img/audio-small.svg';
import ModelSmallIcon from '../../assets/img/model-small.svg';
import UnknownSmallIcon from '../../assets/img/unknown-small.svg';
import DocumentSmallIcon from '../../assets/img/document-small.svg';

function prepareErrorMessage(error: string | undefined): ReactNode {
  if (error === 'Response too large') {
    return <Trans>File is over 100MB</Trans>;
  }
  return error;
}

const StyledCardPreview = styled(Box)`
  height: ${({ height }) => height};
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const AudioWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-image: url(${(props) =>
    props.albumArt ? props.albumArt : 'none'});
  background-position: center;
  align-items: center;
  justify-content: center;
  > audio + svg {
    margin-top: 20px;
  }
  audio {
    position: absolute;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    bottom: 20px;
    text-align: center;
    // box-shadow: 0 3px 15px #000;
    border-radius: 30px;
  }
  img {
    width: 144px;
    height: 144px;
  }
`;

const AudioIconWrapper = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  background: #fff;
  width: 54px;
  height: 54px;
  border-radius: 30px;
  background: #f4f4f4;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  right: 247px;
  line-height: 66px;
  transition: right 0.25s linear, width 0.25s linear, opacity 0.25s;
  visibility: visible;
  display: ${(props) => (props.isPreview ? 'inline-block' : 'none')};
  box-shadow: 0px 0px 24px rgba(24, 162, 61, 0.5),
    0px 4px 8px rgba(18, 99, 60, 0.32);
  border-radius: 32px;
  &.transition {
    width: 300px;
    right: 0px;
    transition: right 0.25s linear, width 0.25s linear;
  }
  &.hide {
    visibility: hidden;
  }
  &.dark {
    background: #333;
  }
`;

const AudioIcon = styled(AudioSvg)`
  position: relative;
  top: 2px;
`;

const IframeWrapper = styled.div`
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  position: relative;
`;

const IframePreventEvents = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 2;
`;

const ModelExtension = styled.div`
  position: relative;
  top: -20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  background: ${(props) => (props.isDarkMode ? '#333' : '#fff')};
  box-shadow: 0px 0px 24px rgba(24, 162, 61, 0.5),
    0px 4px 8px rgba(18, 99, 60, 0.32);
  border-radius: 32px;
  color: ${(props) => (props.isDarkMode ? '#fff' : '#333')};
`;

const AudioControls = styled.div`
  visibility: ${(props) => (props.isPreview ? 'hidden' : 'visible')};
  &.transition {
    visibility: visible;
  }
  audio {
    box-shadow: 0px 0px 24px rgba(24, 162, 61, 0.5),
      0px 4px 8px rgba(18, 99, 60, 0.32);
    border-radius: 32px;
    &.dark {
      ::-webkit-media-controls-enclosure {
        background-color: #333;
      }
      ::-webkit-media-controls-play-button {
        background-image: url('data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZmZmIiBoZWlnaHQ9IjI0IiB3aWR0aD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTggNXYxNGwxMS03eiIvPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48L3N2Zz4=');
      }
      ::-webkit-media-controls-current-time-display {
        color: #fff;
      }
      ::-webkit-media-controls-time-remaining-display {
        color: #fff;
      }
      ::-webkit-media-controls-mute-button {
        background-image: url('data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZmZmIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0zIDl2Nmg0bDUgNVY0TDcgOUgzem0xMy41IDNjMC0xLjc3LTEuMDItMy4yOS0yLjUtNC4wM3Y4LjA1YzEuNDgtLjczIDIuNS0yLjI1IDIuNS00LjAyek0xNCAzLjIzdjIuMDZjMi44OS44NiA1IDMuNTQgNSA2Ljcxcy0yLjExIDUuODUtNSA2LjcxdjIuMDZjNC4wMS0uOTEgNy00LjQ5IDctOC43N3MtMi45OS03Ljg2LTctOC43N3oiLz4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KPC9zdmc+');
      }
      ::--webkit-media-controls-fullscreen-button {
        background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjQgMjQiIHhtbDpzcGFjZT0icHJlc2VydmUiIGZpbGw9IldpbmRvd1RleHQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iNiIgcj0iMiIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IiNmZmYiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjE4IiByPSIjZmZmIi8+PC9zdmc+');
      }
      ::-webkit-media-controls-toggle-closed-captions-button {
        display: none;
      }
      ::-webkit-media-controls-timeline {
        background: #444;
        border-radius: 4px;
        margin-left: 7px;
      }
    }
  }
`;

const StatusContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
`;

const StatusPill = styled.div`
  background-color: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 16px;
  box-sizing: border-box;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  display: flex;
  height: 30px;
  margin-top: 20px;
  padding: 8px 20px;
`;

const StatusText = styled.div`
  font-family: 'Roboto', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
`;

const BlobBg = styled.div`
  > svg {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
  }
  > img {
    position: relative;
  }
`;

const CompactIconFrame = styled.div`
  > svg:nth-child(2) {
    position: absolute;
    left: 23px;
    top: 14px;
    width: 32px;
    height: 32px;
  }
`;

const CompactIcon = styled(CompactIconSvg)`
  width: 66px;
  height: 66px;
  filter: drop-shadow(0px 2px 4px rgba(18 99 60 / 0.5));
  path {
    fill: #fff;
  }
`;

const CompactVideoIcon = styled(VideoSmallIcon)``;
const CompactAudioIcon = styled(AudioSmallIcon)``;
const CompactUnknownIcon = styled(UnknownSmallIcon)``;
const CompactDocumentIcon = styled(DocumentSmallIcon)``;
const CompactModelIcon = styled(ModelSmallIcon)``;

const CompactExtension = styled.div`
  position: absolute;
  top: 48px;
  left: 0;
  right: 4px;
  text-align: center;
  font-size: 11px;
  color: #3aac59;
`;

export type NFTPreviewProps = {
  nft: NFTInfo;
  height?: number | string;
  width?: number | string;
  fit?: 'cover' | 'contain' | 'fill';
  elevate?: boolean;
  background?: any;
  hideStatusBar?: boolean;
  isPreview?: boolean;
  metadata?: any;
  disableThumbnail?: boolean;
  isCompact?: boolean;
  metadataError: any;
};

let loopImageInterval: any;
let isPlaying: boolean = false;
let audioAnimationInterval;

//=========================================================================//
// NFTPreview function
//=========================================================================//
export default function NFTPreview(props: NFTPreviewProps) {
  const {
    nft,
    nft: { dataUris },
    height = '300px',
    width = '100%',
    fit = 'cover',
    background: Background = Fragment,
    hideStatusBar = false,
    isPreview = false,
    isCompact = false,
    metadata,
    disableThumbnail = false,
    metadataError,
  } = props;

  const hasFile = dataUris?.length > 0;
  const file = dataUris?.[0];
  let extension: string = new URL(file).pathname.split('.').slice(-1)[0];
  if (!extension.match(/^[a-zA-Z0-9]+$/)) {
    extension = '';
  }

  const [ignoreSizeLimit, setIgnoreSizeLimit] = usePersistState<boolean>(
    false,
    `nft-preview-ignore-size-limit-${nft.$nftId}-${file}`,
  );

  const [loaded, setLoaded] = useState(false);
  const { isValid, isLoading, error, thumbnail } = useNFTHash(
    nft,
    ignoreSizeLimit,
    isPreview,
    metadata,
    metadataError,
  );

  const [ignoreError, setIgnoreError] = usePersistState<boolean>(
    false,
    `nft-preview-ignore-error-${nft.$nftId}-${file}`,
  );

  const iframeRef = useRef<any>(null);
  const audioIconRef = useRef<any>(null);
  const audioControlsRef = useRef<any>(null);
  const videoThumbnailRef = useRef<any>(null);

  const isUrlValid = useMemo(() => {
    if (!file) {
      return false;
    }

    return isURL(file);
  }, [file]);

  const [statusText, isStatusError] = useMemo(() => {
    if (nft.pendingTransaction) {
      return [t`Update Pending`, false];
    } else if (error === 'Hash mismatch') {
      return [t`Image Hash Mismatch`, true];
    }
    return [undefined, false];
  }, [nft, isValid, error, ignoreError]);

  const { isDarkMode } = useDarkMode();

  const [srcDoc, hasPlaybackControls] = useMemo(() => {
    if (!file) {
      return;
    }

    const hideVideoCss = isPreview
      ? `
      video::-webkit-media-controls {
        display: none !important;
      }   
    `
      : '';

    const style = `
      html, body {
        border: 0px;
        margin: 0px;
        padding: 0px;
        height: 100%;
        width: 100%;
        text-align: center;
      }

      body {
        overflow: hidden;
      }

      img {
        object-fit: ${fit};
      }

      #status-container {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        width: 100%;
      }

      #status-pill {
        background-color: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(6px);
        border: 1px solid rgba(255, 255, 255, 0.13);
        border-radius: 16px;
        box-sizing: border-box;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        display: flex;
        height: 30px;
        margin-top: 20px;
        padding: 8px 20px;
      }

      #status-text {
        font-family: 'Roboto', sans-serif;
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 14px;
      }
      audio {
        margin-top: 140px;
      }     
      ${hideVideoCss}
    `;

    let mediaElement = null;
    let hasPlaybackControls = false;

    if (thumbnail.image) {
      mediaElement = (
        <img
          src={thumbnail.image}
          alt={t`Preview`}
          width="100%"
          height="100%"
        />
      );
    } else if (mimeType().match(/^video/)) {
      mediaElement = (
        <video width="100%" height="100%">
          <source src={file} />
        </video>
      );
      hasPlaybackControls = true;
    } else {
      mediaElement = (
        <img src={file} alt={t`Preview`} width="100%" height="100%" />
      );
    }

    const elem = renderToString(
      <html>
        <head>
          <style dangerouslySetInnerHTML={{ __html: style }} />
        </head>
        <body>
          {mediaElement}
          {statusText && !hideStatusBar && (
            <div id="status-container">
              <div id="status-pill">
                <span id="status-text">{statusText}</span>
              </div>
            </div>
          )}
        </body>
      </html>,
    );

    return [elem, hasPlaybackControls];
  }, [file, statusText, isStatusError, thumbnail, error]);

  function mimeType(): string {
    const pathName: string = new URL(file).pathname;
    return mime.lookup(pathName) || '';
  }

  function getVideoDOM() {
    if (videoThumbnailRef.current) {
      return videoThumbnailRef.current;
    }
    return null;
  }

  function stopVideo() {
    const video = getVideoDOM();
    if (video && !video.paused) {
      video.pause();
    }
  }

  function hideVideoControls() {
    const video = getVideoDOM();
    if (video) {
      video.controls = false;
      video.removeAttribute('controls');
      video.playsInline = true;
    }
  }

  function handleLoadedChange(loadedValue: any) {
    setLoaded(loadedValue);
    if (thumbnail.video) {
      hideVideoControls();
    }
  }

  function handleIgnoreError(event: any) {
    event.stopPropagation();

    setIgnoreError(true);
    if (error === 'Response too large') {
      setIgnoreSizeLimit(true);
    }
  }

  function renderAudioTag() {
    return (
      <AudioControls
        ref={audioControlsRef}
        isPreview={isPreview && !disableThumbnail}
      >
        <audio className={isDarkMode ? 'dark' : ''} controls>
          <source src={file} />
        </audio>
      </AudioControls>
    );
  }

  function renderAudioIcon() {
    return (
      <AudioIconWrapper
        ref={audioIconRef}
        isPreview={isPreview && !disableThumbnail}
        className={isDarkMode ? 'dark' : ''}
      >
        <AudioIcon />
      </AudioIconWrapper>
    );
  }

  function audioMouseEnter(e: any) {
    if (!isPreview) return;
    if (!isPlaying) {
      if (audioIconRef.current)
        audioIconRef.current.classList.add('transition');
      audioAnimationInterval = setTimeout(() => {
        if (audioControlsRef.current)
          audioControlsRef.current.classList.add('transition');
        if (audioIconRef.current) audioIconRef.current.classList.add('hide');
      }, 250);
    }
  }

  function audioMouseLeave(e: any) {
    if (audioAnimationInterval) {
      clearTimeout(audioAnimationInterval);
    }
    if (!isPreview) return;
    if (!isPlaying) {
      if (audioIconRef.current) {
        audioIconRef.current.classList.remove('transition');
        audioIconRef.current.classList.remove('hide');
      }
      if (audioControlsRef.current) {
        audioControlsRef.current.classList.remove('transition');
      }
    }
  }

  function audioPlayEvent(e: any) {
    isPlaying = true;
  }

  function audioPauseEvent(e: any) {
    isPlaying = false;
  }

  function videoMouseEnter(e: any) {
    e.stopPropagation();
    e.preventDefault();
    const videoDOM = getVideoDOM();
    if (isPreview && thumbnail.video && videoDOM) {
      videoDOM.pause();
      videoDOM.play();
    }
  }

  function videoMouseLeave() {
    if (isPreview && thumbnail.video) {
      stopVideo();
    }
    if (thumbnail.images) {
      clearTimeout(loopImageInterval);
    }
  }

  function isDocument() {
    return (
      [
        'pdf',
        'docx',
        'doc',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
        'txt',
        'rtf',
      ].indexOf(extension) > -1
    );
  }

  function renderCompactIcon() {
    return (
      <CompactIconFrame>
        <CompactIcon />
        {mimeType().match(/^video/) && <CompactVideoIcon />}
        {mimeType().match(/^audio/) && <CompactAudioIcon />}
        {mimeType().match(/^model/) && <CompactModelIcon />}
        {isDocument() && <CompactDocumentIcon />}
        {isUnknownType() && <CompactUnknownIcon />}
        {extension && <CompactExtension>.{extension}</CompactExtension>}
      </CompactIconFrame>
    );
  }

  function renderNftIcon() {
    if (isDocument()) {
      return (
        <>
          <BlobBg>
            <DocumentBlobIcon />
            <img src={isDarkMode ? DocumentPngDarkIcon : DocumentPngIcon} />
          </BlobBg>
        </>
      );
    } else if (mimeType().match(/^model/)) {
      return (
        <>
          <BlobBg>
            <ModelBlobIcon />
            <img src={isDarkMode ? ModelPngDarkIcon : ModelPngIcon} />
          </BlobBg>
        </>
      );
    } else if (mimeType().match(/^video/)) {
      return (
        <>
          <BlobBg>
            <VideoBlobIcon />
            <img src={isDarkMode ? VideoPngDarkIcon : VideoPngIcon} />
          </BlobBg>
        </>
      );
    } else {
      return (
        <>
          <BlobBg>
            <UnknownBlobIcon />
            <img src={isDarkMode ? UnknownPngDarkIcon : UnknownPngIcon} />;
          </BlobBg>
        </>
      );
    }
  }

  function isUnknownType() {
    return (
      !isDocument() &&
      !mimeType().match(/^audio/) &&
      !mimeType().match(/^video/) &&
      !mimeType().match(/^image/) &&
      !mimeType().match(/^model/)
    );
  }

  function renderElementPreview() {
    if (isCompact && !mimeType().match(/^image/)) {
      return renderCompactIcon();
    }

    const isOfferNft =
      disableThumbnail &&
      !mimeType().match(/^video/) &&
      !mimeType().match(/^audio/) &&
      !mimeType().match(/^image/);

    const notPreviewNft =
      !disableThumbnail &&
      !isPreview &&
      (mimeType().match(/^model/) || isDocument() || isUnknownType());

    const isPreviewNft =
      mimeType() !== '' &&
      !mimeType().match(/^image/) &&
      !thumbnail.video &&
      !thumbnail.image &&
      !mimeType().match(/^audio/) &&
      isPreview &&
      !disableThumbnail;

    if (isOfferNft || isPreviewNft || notPreviewNft) {
      return (
        <>
          {renderNftIcon()}
          {extension && (
            <ModelExtension isDarkMode={isDarkMode}>
              .{extension}
            </ModelExtension>
          )}
        </>
      );
    }

    if (isPreview && thumbnail.video && !disableThumbnail) {
      return (
        <video
          width="100%"
          height="100%"
          ref={videoThumbnailRef}
          onMouseEnter={videoMouseEnter}
          onMouseLeave={videoMouseLeave}
        >
          <source src={thumbnail.video} />
        </video>
      );
    }

    if (
      mimeType().match(/^audio/) &&
      (!isPreview ||
        (isPreview && !thumbnail.video && !thumbnail.image) ||
        disableThumbnail)
    ) {
      return (
        <AudioWrapper
          onMouseEnter={audioMouseEnter}
          onMouseLeave={audioMouseLeave}
          onPlay={audioPlayEvent}
          onPause={audioPauseEvent}
          albumArt={thumbnail.image}
        >
          {!thumbnail.image && (
            <>
              <BlobBg>
                <AudioBlobIcon />
                <img src={isDarkMode ? AudioPngDarkIcon : AudioPngIcon} />
              </BlobBg>
            </>
          )}
          {renderAudioTag()}
          {renderAudioIcon()}
          {!thumbnail.image ? (
            <ModelExtension isDarkMode={isDarkMode}>
              .{extension}
            </ModelExtension>
          ) : null}
        </AudioWrapper>
      );
    }

    return (
      <IframeWrapper ref={iframeRef}>
        {isPreview && <IframePreventEvents />}
        <SandboxedIframe
          srcDoc={srcDoc}
          height={height}
          onLoadedChange={handleLoadedChange}
          hideUntilLoaded
          allowPointerEvents={!!hasPlaybackControls}
        />
      </IframeWrapper>
    );
  }

  function ThumbnailError(props: any) {
    return (
      <StatusContainer>
        <StatusPill>
          <StatusText>{props.children}</StatusText>
        </StatusPill>
      </StatusContainer>
    );
  }

  return (
    <StyledCardPreview height={height} width={width}>
      {!hasFile ? (
        <Background>
          <IconMessage icon={<NotInterested fontSize="large" />}>
            <Trans>No file available</Trans>
          </IconMessage>
        </Background>
      ) : !isUrlValid ? (
        <Background>
          <IconMessage icon={<ErrorIcon fontSize="large" />}>
            <Trans>Preview URL is not valid</Trans>
          </IconMessage>
        </Background>
      ) : error === 'missing preview_video_hash' ? (
        <ThumbnailError>
          <Trans>Missing preview_video_hash key</Trans>
        </ThumbnailError>
      ) : error === 'missing preview_image_hash' ? (
        <ThumbnailError>
          <Trans>Missing preview_image_hash key</Trans>
        </ThumbnailError>
      ) : error === 'failed fetch content' ? (
        <ThumbnailError>
          <Trans>Error fetching video preview</Trans>
        </ThumbnailError>
      ) : error === 'thumbnail hash mismatch' ? (
        <ThumbnailError>
          <Trans>Thumbnail hash mismatch</Trans>
        </ThumbnailError>
      ) : error === 'Error parsing json' ? (
        <ThumbnailError>
          <Trans>Error parsing json</Trans>
        </ThumbnailError>
      ) : metadataError?.message === 'Hash mismatch' ? (
        <ThumbnailError>
          <Trans>Metadata hash mismatch</Trans>
        </ThumbnailError>
      ) : isLoading ? (
        <Background>
          <Loading center>
            <Trans>Loading preview...</Trans>
          </Loading>
        </Background>
      ) : error && !isStatusError && !ignoreError ? (
        <Background>
          <Flex direction="column" gap={2}>
            <IconMessage icon={<ErrorIcon fontSize="large" />}>
              {prepareErrorMessage(error)}
            </IconMessage>
            <Button
              onClick={handleIgnoreError}
              variant="outlined"
              size="small"
              color="secondary"
            >
              <Trans>Show Preview</Trans>
            </Button>
          </Flex>
        </Background>
      ) : (
        <>
          {!loaded && Object.keys(thumbnail).length === 0 && (
            <Flex
              position="absolute"
              left="0"
              top="0"
              bottom="0"
              right="0"
              justifyContent="center"
              alignItems="center"
            >
              <Loading center>
                <Trans>Loading preview...</Trans>
              </Loading>
            </Flex>
          )}
          {renderElementPreview()}
        </>
      )}
    </StyledCardPreview>
  );
}
