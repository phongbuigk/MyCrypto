import React from 'react';
import styled from 'styled-components';

import { COLORS } from 'v2/theme';

const { DARK_GREY } = COLORS;

const CodeBlockWrapper = styled.div`
  font-weight: 400;
  border: 1px solid ${DARK_GREY};
  padding: 0.75rem 1rem;
  margin: 0;
  margin-bottom: 1rem;
  border-radius: 2px;
  overflow: auto;
  font-size: 0.8em;
`;

const Code = styled.div`
  display: block;
  text-align: left;
  max-height: 320px;
  border: none;
  background-color: inherit;
  white-space: pre;
  font-family: 'Roboto Mono';
`;

interface Props {
  children?: React.ReactNode;
  className?: string;
}

const CodeBlock = ({ children }: Props) => (
  <CodeBlockWrapper>
    <Code>{children}</Code>
  </CodeBlockWrapper>
);

export default CodeBlock;
