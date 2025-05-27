import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC } from "react";

type BalanceSolProps = {
  balance: number;
};

export const BalanceSol: FC<BalanceSolProps> = ({ balance }) => (
  <span>{Math.round((balance / LAMPORTS_PER_SOL) * 100000) / 100000}</span>
);
