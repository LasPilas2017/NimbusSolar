import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function Supervisor() {
  const [personal, setPersonal] = useState([]);
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    cargarPersonal();
  }, []);

  const cargarPersonal = async () => {
    const { data, error } = await supabase.from('registrodepersonal').select('*');
    if (!error) setPersonal(data);
  };

  const guardarCambios = async (id, camposActualizados) => {
    const { error } = await supabase
      .from('registrodepersonal')
      .update(camposActualizados)
      .eq('id', id);

    if (!error) {
      setEditando(null);
      cargarPersonal();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white/90 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">👷 Encargado de Campo</h2>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Puesto</th>
            <th className="border p-2">Proyecto</th>
            <th className="border p-2">Salario</th>
            <th className="border p-2">Meta</th>
            <th className="border p-2">Bonificación</th>
            <th className="border p-2">Grupo</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {personal.map((p) => {
            const esFijo = p.modalidad === 'fijo';
            const enEdicion = editando === p.id;

            return (
              <tr key={p.id} className="bg-white">
                <td className="border p-2">{p.nombrecompleto}</td>
                <td className="border p-2">{p.puesto}</td>
                <td className="border p-2">{p.proyecto}</td>

                {/* Salario */}
                <td className="border p-2">
                  {esFijo ? (
                    `Q${p.salariopordia?.toFixed(2)}`
                  ) : enEdicion ? (
                    <input
                      type="number"
                      defaultValue={p.salariopordia}
                      onChange={(e) => (p.salariopordia = parseFloat(e.target.value))}
                      className="border p-1 w-full"
                    />
                  ) : (
                    `Q${p.salariopordia?.toFixed(2)}`
                  )}
                </td>

                {/* Meta */}
                <td className="border p-2">
                  {esFijo ? (
                    '-'
                  ) : enEdicion ? (
                    <input
                      type="number"
                      defaultValue={p.metaestablecida}
                      onChange={(e) => (p.metaestablecida = parseInt(e.target.value))}
                      className="border p-1 w-full"
                    />
                  ) : (
                    p.metaestablecida
                  )}
                </td>

                {/* Bonificación */}
                <td className="border p-2">
                  {esFijo ? (
                    '-'
                  ) : enEdicion ? (
                    <input
                      type="number"
                      defaultValue={p.bonificacion}
                      onChange={(e) => (p.bonificacion = parseFloat(e.target.value))}
                      className="border p-1 w-full"
                    />
                  ) : (
                    `Q${p.bonificacion}`
                  )}
                </td>

                {/* Grupo */}
                <td className="border p-2">
                  {esFijo ? (
                    '-'
                  ) : enEdicion ? (
                    <input
                      type="text"
                      defaultValue={p.numerogrupo}
                      onChange={(e) => (p.numerogrupo = e.target.value)}
                      className="border p-1 w-full"
                    />
                  ) : (
                    p.numerogrupo || "-"
                  )}
                </td>

                {/* Acciones */}
                <td className="border p-2">
                  {!esFijo && (
                    enEdicion ? (
                      <button
                        onClick={() =>
                          guardarCambios(p.id, {
                            salariopordia: p.salariopordia,
                            metaestablecida: p.metaestablecida,
                            bonificacion: p.bonificacion,
                            numerogrupo: p.numerogrupo,
                          })
                        }
                        className="text-green-600 font-semibold"
                      >
                        Guardar
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditando(p.id)}
                        className="text-blue-600 font-semibold"
                      >
                        Edita
                      </button>
                    )
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
