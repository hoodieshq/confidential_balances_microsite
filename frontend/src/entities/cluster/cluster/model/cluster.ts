import { Cluster } from "@/shared/solana";
import { atomWithStorage } from "jotai/utils";
import { defaultClusters } from "./default-clusters";

export const clusterAtom = atomWithStorage<Cluster>(
  "solana-cluster",
  defaultClusters[0]
);
