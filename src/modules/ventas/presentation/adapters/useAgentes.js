













import { useEffect, useMemo, useState } from "react";
import { AgentesHttpRepository } from "../../infra/http/AgentesHttpRepository";
import { ListAgentesUseCase } from "../../application/use-cases/ListAgentesUseCase";

export function useAgentes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const repo = useMemo(() => new AgentesHttpRepository(), []);
  const uc   = useMemo(() => new ListAgentesUseCase(repo), [repo]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const res = await uc.execute();
      if (alive) {
        setData(res);         // ✅ separado
        setLoading(false);    // ✅ separado
      }
    })();
    return () => { alive = false; };
  }, [uc]);

  return { data, loading };
}
