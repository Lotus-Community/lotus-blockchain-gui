import React from 'react';
import styled from 'styled-components';
import { Box, BoxProps } from '@mui/material';
import { Lotus } from '@lotus/icons';

const StyledLotus = styled(Lotus)`
  max-width: 100%;
  width: auto;
  height: auto;
`;

export default function Logo(props: BoxProps) {
  return (
    <Box {...props}>
      <StyledLotus />
    </Box>
  );
}
