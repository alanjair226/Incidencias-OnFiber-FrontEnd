"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkToken = () => {
          const token = localStorage.getItem("token");
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split(".")[1]));
    
              // Validar si el token ha expirado
              const isExpired = payload.exp * 1000 < Date.now();
              if (isExpired) {
                localStorage.removeItem("token");
                return;
              }
    
              // Redirigir según el rol del usuario
              if (payload.role === "user") {
                router.push("/user/incidences");
              } else if (payload.role === "admin") {
                router.push("/admin/dashboard");
              }
            } catch (err) {
              console.error("Error al procesar el token:", err);
              localStorage.removeItem("token");
            }
          }
        };
    
        checkToken();
      }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Credenciales incorrectas");
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);

            const payload = JSON.parse(atob(data.token.split(".")[1]));

            if (payload.role === "admin") {
                router.push("/admin/dashboard");
            } else if (payload.role === "user") {
                router.push("/user/incidences");
            }
        } catch (err: any) {
            setError("Error al iniciar sesión. Verifica tus credenciales.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center dark:bg-dark-primary">
            <div className="bg-dark-secondary text-dark-text-primary p-6 rounded-lg shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold text-center mb-4">Iniciar Sesión</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-dark-text-secondary text-sm mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 bg-dark-primary text-dark-text-primary border border-dark-secondary rounded focus:outline-none focus:ring-2 focus:ring-dark-accent"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-dark-text-secondary text-sm mb-1">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 bg-dark-primary text-dark-text-primary border border-dark-secondary rounded focus:outline-none focus:ring-2 focus:ring-dark-accent"
                            required
                        />
                    </div>
                    {error && <p className="text-dark-error text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-2 bg-dark-accent text-dark-primary font-bold rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-dark-accent"
                    >
                        Iniciar sesión
                    </button>
                </form>
            </div>
        </div>
    );
}
