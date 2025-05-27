import { useCluster } from "@/shared/solana";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren } from "react";

export const ClusterChecker: FC<PropsWithChildren> = ({ children }) => {
  const { cluster } = useCluster();
  const { connection } = useConnection();

  const query = useQuery({
    queryKey: ["version", { cluster, endpoint: connection.rpcEndpoint }],
    queryFn: () => connection.getVersion(),
    retry: 1,
  });

  if (query.isLoading) {
    return null;
  }

  if (query.isError || !query.data) {
    return (
      <div className="alert alert-warning text-warning-content/80 rounded-none flex justify-center">
        <span>
          Error connecting to cluster <strong>{cluster.name}</strong>
        </span>
        <button
          className="btn btn-xs btn-neutral"
          onClick={() => query.refetch()}
        >
          Refresh
        </button>
      </div>
    );
  }
  return children;
};
