import { WalletButton } from "@/app/solana-provider";
import { FC } from "react";

export const List: FC = () => (
  <div className="hero py-[64px]">
    <div className="hero-content text-center">
      <WalletButton />
    </div>
  </div>
);
