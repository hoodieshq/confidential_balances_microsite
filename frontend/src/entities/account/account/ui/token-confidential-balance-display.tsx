import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useConfidentialVisibility } from "../model/use-confidential-visibility";
import { useDecryptConfidentialBalance } from "../model/use-decrypt-confidential-balance";
import { FC } from "react";

type TokenConfidentialBalanceDisplayProps = {
  tokenAccountPubkey: PublicKey;
};

export const TokenConfidentialBalanceDisplay: FC<
  TokenConfidentialBalanceDisplayProps
> = ({ tokenAccountPubkey }) => {
  const { isVisible, showBalance, hideBalance } =
    useConfidentialVisibility(tokenAccountPubkey);
  const { decryptBalance, isDecrypting, confidentialBalance, error } =
    useDecryptConfidentialBalance();
  const wallet = useWallet();

  const handleDecryptBalance = async () => {
    const result = await decryptBalance(tokenAccountPubkey);
    if (result) {
      showBalance();
    }
  };

  return (
    <div className="w-full bg-gray-900 rounded-lg p-6">
      <div className="flex flex-col">
        <div className="pt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium text-gray-400">
              Confidential Balance
            </h3>
            {isVisible && (
              <button
                className="text-blue-500 hover:text-blue-400"
                onClick={hideBalance}
              >
                Hide
              </button>
            )}
          </div>

          {!isVisible ? (
            <div className="mt-4">
              {isDecrypting ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-gray-400">Decrypting balance...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleDecryptBalance}
                    className="px-5 py-2 bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 border border-gray-700 flex items-center"
                    disabled={!wallet.connected}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Decrypt Available Balance
                  </button>
                  {error && (
                    <p className="mt-2 text-red-500 text-sm">{error}</p>
                  )}
                  {!wallet.connected && (
                    <p className="mt-2 text-yellow-500 text-sm">
                      Connect wallet to decrypt
                    </p>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="mt-2">
              <div className="flex items-center">
                <div className="text-5xl font-bold text-blue-500">
                  {confidentialBalance} Tokens
                </div>
                <svg
                  className="w-6 h-6 ml-3 text-blue-500"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This balance is encrypted and only visible to you
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
