"use client";

import { createContext, useContext, useEffect, useState } from "react";

const TEMA_STORAGE_KEY = "vitanuts-calc:tema";

type TemaContexto = { dark: boolean; alternarTema: () => void };

const Contexto = createContext<TemaContexto | null>(null);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  // Padrão é escuro; só muda pra claro se o usuário já tiver escolhido isso antes.
  const [dark, setDark] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.localStorage.getItem(TEMA_STORAGE_KEY) === "light") setDark(false);
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
