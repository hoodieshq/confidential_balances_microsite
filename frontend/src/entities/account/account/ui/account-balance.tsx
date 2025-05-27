import { PublicKey } from "@solana/web3.js";
import { useGetBalance } from "../model/use-get-balance";
import { FC } from "react";
import { BalanceSol } from "./balance-sol";

type AccountBalanceProps = {
  address: PublicKey;
};

export const AccountBalance: FC<AccountBalanceProps> = ({ address }) => {
  const query = useGetBalance({ address });

  return (
    <div>
      <h1
        className="text-5xl font-bold cursor-pointer"
        onClick={() => query.refetch()}
      >
        {query.data ? <BalanceSol balance={query.data} /> : "..."} SOL
      </h1>
    </div>
  );
};
