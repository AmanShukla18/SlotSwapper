/// <reference types="next" />

import type { ReactElement, ReactNode } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export type LayoutProps = {
  children: ReactNode;
};

export type PageProps = {
  children?: ReactNode;
};