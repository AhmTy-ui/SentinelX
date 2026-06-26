"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const CHAINS = [
  { id: "ethereum", label: "Ethereum" },
  { id: "base", label: "Base" },
  { id: "arbitrum", label: "Arbitrum" },
  { id: "bnb", label: "BNB Chain" },
];

interface AppState {
  chain: string;
  setChain: (c: string) => void;
  wallet: string | null;
  connect: (addr: string) => void;
  disconnect: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [chain, setChainState] = useState("ethereum");
  const [wallet, setWallet] = useState<string | null>(null);

  useEffect(() => {
    const c = localStorage.getItem("sx_chain");
    const w = localStorage.getItem("sx_wallet");
    if (c) setChainState(c);
    if (w) setWallet(w);
  }, []);

  const setChain = (c: string) => {
    setChainState(c);
    localStorage.setItem("sx_chain", c);
  };
  const connect = (addr: string) => {
    setWallet(addr);
    localStorage.setItem("sx_wallet", addr);
  };
  const disconnect = () => {
    setWallet(null);
    localStorage.removeItem("sx_wallet");
  };

  return (
    <Ctx.Provider value={{ chain, setChain, wallet, connect, disconnect }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
