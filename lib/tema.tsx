"use client";

import { createContext, useContext, useEffect, useState } from "react";

const TEMA_STORAGE_KEY = "vitanuts-calc:tema";

type TemaContexto = { dark: boolean; alternarTema: () => void };

const Contexto = createContext<TemaContexto | null>(null);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.localStorage.getItem(TEMA_STORAGE_KEY) === "dark") setDark(true);
  }, []);

  function alternarTema() {
    setDark((atual) => {
      const novo = !atual;
      window.localStorage.setItem(TEMA_STORAGE_KEY, novo ? "dark" : "light");
      return novo;
    });
  }

  return (
    <Contexto.Provider value={{ dark, alternarTema }}>
      {children}
    </Contexto.Provider>
  );
}

export function useTema(): TemaContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useTema deve ser usado dentro de <TemaProvider>");
  return ctx;
}
