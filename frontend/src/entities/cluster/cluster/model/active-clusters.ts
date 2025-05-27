import { atom } from "jotai";
import { Cluster } from "@/shared/solana";
import { clustersAtom } from "./clusters";
import { clusterAtom } from "./cluster";

export const activeClustersAtom = atom<Cluster[]>((get) => {
  const clusters = get(clustersAtom);
  const cluster = get(clusterAtom);

  return clusters.map((item) => ({
    ...item,
    active: item.name === cluster.name,
  }));
});
