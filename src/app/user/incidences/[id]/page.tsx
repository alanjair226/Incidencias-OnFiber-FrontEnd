"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Incidence } from "../../../../types";
import { addCommentToIncidence } from "../../../../utils/incidences";

export default function IncidenceDetails() {
  const [incidence, setIncidence] = useState<Incidence | null>(null);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();
  const { id } = useParams();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.id);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/incidences/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener la incidencia");
      }

      const data: Incidence = await response.json();
      setIncidence(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, router]);

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      setError("El comentario no puede estar vacío");
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      await addCommentToIncidence(Number(id), comment, token);

      setSuccess("Comentario agregado con éxito");
      setComment("");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusLabel = () => {
    if (!incidence) return null;
    if (incidence.status) {
      return (
        <span className="text-dark-warning font-semibold">En Revisión</span>
      );
    }
    if (!incidence.comment) {
      return null;
    }
    return <span className="text-dark-success font-semibold">Resuelta</span>;
  };

  const getValidityLabel = () => {
    if (!incidence) return null;
    return incidence.valid ? (
      <span className="bg-dark-error text-dark-primary px-2 py-1 rounded text-sm font-semibold">
        Esta incidencia es válida
      </span>
    ) : (
      <span className="bg-dark-success text-dark-primary px-2 py-1 rounded text-sm font-semibold">
        No cuenta
      </span>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-dark-primary text-dark-text-primary">
      <h1 className="text-3xl font-bold text-center mb-6">Detalles de la Incidencia</h1>
      {loading ? (
        <div className="text-center text-lg">Cargando incidencia...</div>
      ) : error ? (
        <div className="text-center text-lg text-dark-error">Error: {error}</div>
      ) : incidence ? (
        <>
          {/* Incidence Details */}
          <div className="p-6 bg-dark-secondary rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">{incidence.description}</h2>
            <div className="flex flex-wrap gap-4 mb-4">
              <p>
                <strong>Severidad:</strong> {incidence.severity.name}
              </p>
              <p>
                <strong>Valor:</strong> {incidence.value}
              </p>
              <p>
                <strong>Estado:</strong> {getStatusLabel()}
              </p>
              {getValidityLabel()}
            </div>
            <p>
              <strong>Creado por:</strong> {incidence.created_by.username}
            </p>
            <p>
              <strong>Asignado a:</strong> {incidence.assigned_to.username}
            </p>
            <p>
              <strong>Fecha de creación:</strong>{" "}
              {new Date(incidence.created_at).toLocaleString()}
            </p>
          </div>

          {/* Existing Comment */}
          {incidence.comment && (
            <div className="p-6 bg-dark-secondary rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-bold mb-2">Comentario existente</h3>
              <p className="text-dark-text-secondary">{incidence.comment}</p>
            </div>
          )}

          {/* Add Comment Form */}
          {incidence.assigned_to.id === currentUserId &&
            !incidence.status &&
            !incidence.comment &&
            incidence.period.is_open && (
              <div className="p-6 bg-dark-secondary rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-bold mb-4">Añadir Comentario</h3>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 mb-4 bg-dark-primary text-dark-text-primary border border-dark-secondary rounded focus:outline-none focus:ring-2 focus:ring-dark-accent"
                  placeholder="Escribe tu comentario aquí..."
                />
                <button
                  onClick={handleCommentSubmit}
                  className="bg-dark-accent text-dark-primary py-2 px-4 rounded hover:bg-purple-700 transition"
                >
                  Enviar Comentario
                </button>
                {error && <p className="text-dark-error mt-4">{error}</p>}
                {success && <p className="text-dark-success mt-4">{success}</p>}
              </div>
            )}

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => router.back()}
              className="mt-4 bg-dark-accent text-dark-primary py-2 px-6 rounded hover:bg-purple-700 transition"
            >
              Volver
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">No se encontraron detalles para esta incidencia.</div>
      )}
    </div>
  );
}
