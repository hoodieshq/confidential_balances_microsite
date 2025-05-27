"use client";

import { FC, type PropsWithChildren } from "react";
import { JotaiProvider, ReactQueryProvider } from "./state-providers";
import { SolanaProvider } from "./solana-provider";
import { ClusterProvider } from "./cluster-provider";

export const App: FC<PropsWithChildren> = ({ children }) => (
  <JotaiProvider>
    <ReactQueryProvider>
      <ClusterProvider>
        <SolanaProvider>4{children}</SolanaProvider>
      </ClusterProvider>
    </ReactQueryProvider>
  </JotaiProvider>
);
