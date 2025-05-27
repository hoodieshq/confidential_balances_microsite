import { useCluster } from "@/shared/solana/cluster";
import { FC } from "react";

type ExplorerLinkProps = {
  path: string;
  label: string;
  className?: string;
};

export const ExplorerLink: FC<ExplorerLinkProps> = ({
  path,
  label,
  className,
}) => {
  const { getExplorerUrl } = useCluster();
  return (
    <a
      href={getExplorerUrl(path)}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? className : `link font-mono`}
    >
      {label}
    </a>
  );
};
