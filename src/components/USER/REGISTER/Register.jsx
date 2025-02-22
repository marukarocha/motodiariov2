import React, { useState } from "react";
import { auth } from "../../../lib/db/firebaseServices";
import { createUserWithEmailAndPassword } from "firebase/auth";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Usuário registrado com sucesso! Faça login para continuar.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Este e-mail já está registrado. Tente fazer login.");
      } else if (error.code === "auth/weak-password") {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else if (error.code === "auth/invalid-email") {
        setError("Por favor, insira um e-mail válido.");
      } else {
        setError("Ocorreu um erro ao registrar. Tente novamente.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Registrar-se</h2>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control"
                    placeholder="Digite seu e-mail"
                    aria-describedby="emailHelp"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Senha
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-control"
                    placeholder="Digite sua senha"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirm-password" className="form-label">
                    Confirme a Senha
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="form-control"
                    placeholder="Confirme sua senha"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Registrar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
