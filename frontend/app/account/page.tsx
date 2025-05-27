"use client";

import { List } from "@/pages/accounts/list";
import { useWallet } from "@solana/wallet-adapter-react";
import { type NextPage } from "next";
import { redirect } from "next/navigation";

const Page: NextPage = ({}) => {
  const { publicKey } = useWallet();

  if (publicKey) {
    return redirect(`/account/${publicKey.toString()}`);
  }

  return <List />;
};

export default Page;
