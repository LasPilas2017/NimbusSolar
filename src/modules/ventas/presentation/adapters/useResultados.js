// src/modules/ventas/presentation/adapters/useResultados.js
import { useEffect, useMemo, useState } from "react";
import { GetResultadosUseCase } from "../../application/use-cases/GetResultadosUseCase";
import { ResultadosHttpRepository } from "../../infra/http/ResultadosHttpRepository";

export function useResultados(userId, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const repo = useMemo(() => new ResultadosHttpRepository(/* httpClient? */), []);
  const usecase = useMemo(() => new GetResultadosUseCase(repo), [repo]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await usecase.execute(userId);
        if (alive) setData(res);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, ...deps]);

  return { data, loading };
}
