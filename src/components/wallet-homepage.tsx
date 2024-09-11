"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRightIcon, DrumIcon, Loader, LogOutIcon, SendIcon } from "lucide-react";
import { Transaction, WalletData } from "@/types";
import { useUser } from "@/context/user-context";
import { useSDK } from "@metamask/sdk-react";
// import { signAndSendTransaction } from "@/utils/phantom";

export function WalletHomepage(): JSX.Element {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { loading: userLoading, logout, setAuthStatus } = useUser();
  const {sdk, account, provider, chainId} = useSDK()

  useEffect(() => {
    switchChain()
  }, [account, chainId, provider]);
  
  const switchChain  = () => {
    const targetChainId = '0x28c58'; // The desired chain ID
    
    if (account && chainId && provider) {
      // Check if the current chainId doesn't match the target chainId
      if (chainId !== targetChainId) {
        provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId }],
        })
        .then(() => {
          console.log('Switched to chain ID:', targetChainId);
        })
        .catch((error) => {
            // Chain not found in MetaMask, request to add it
            provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChainId,
                chainName: 'Taiko', // Change to your chain name
                nativeCurrency: {
                  symbol: 'ETH', // Symbol of the native currency
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.taiko.xyz'], // Add your chain's RPC URL
                blockExplorerUrls: ['https://taikoscan.io'], // Add your chain's block explorer
              }],
            })
            .then(() => {
              console.log('Chain added and switched to chain ID:', targetChainId);
            })
            .catch((error) => {
              console.error('Failed to add or switch to chain:', error);
            });
          
        });
      }
    }
  }

  const handleDisconnect = async () => {
    try {
      await sdk?.terminate();
      setBalance(0);
      setTransactions([]);
      setAuthStatus("");
      logout();
      window.location.href = "/"; 
    } catch (error) {
      console.log(error)
    }
  };

  const handleDrum = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if( !account || !provider )return;
    const transactionParameters = {
      to: account, // Required except during contract publications
      from: account, // Must match the user's active address.
      value: '1', // Hexadecimal value of the amount to send (e.g., 1 ETH)
      chainId: '0x28c58',
    };
    setLoading(true)
    provider.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    })
    .then((txHash) => {
      console.log('Transaction hash:', txHash);
    })
    .catch((error) => {
      console.error('Error sending transaction:', error);
    }).finally(() =>
      setLoading(false)
    )
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleDisconnect}>
            <LogOutIcon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            {/* <p className="text-sm text-gray-500">Current Beats</p>
            <p className="text-4xl font-bold">${balance.toFixed(2)}</p> */}
          </div>
          <form onSubmit={handleDrum} className="space-y-4 mb-6">
            <Button type="submit" className="w-full">
              {loading || userLoading ? <Loader className="mr-2 h-4 w-4" /> : <DrumIcon className="mr-2 h-4 w-4" />}
            </Button>
          </form>
          <div>
            <h3 className="font-semibold mb-2">Drumming History</h3>
            {userLoading ? (
              <p>Loading...</p>
            ) : (
              <ScrollArea className="h-[200px]">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2 border-b last:border-b-0"
                  >
                    <div className="flex items-center">
                      <ArrowRightIcon
                        className={`h-4 w-4 mr-2 ${
                          tx.type === "Received"
                            ? "text-green-500 rotate-180"
                            : "text-red-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {tx.type === "Received"
                            ? `From ${tx.from}`
                            : `To ${tx.to}`}
                        </p>
                        <p className="text-xs text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                    <p
                      className={`font-medium ${
                        tx.type === "Received"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {tx.type === "Received" ? "+" : "-"}$
                      {tx.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
