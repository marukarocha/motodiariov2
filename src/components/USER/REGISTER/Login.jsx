import React, { useState } from "react";
import { auth } from "../../../lib/db/firebaseServices";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom'; // Importe useNavigate

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Use o hook useNavigate

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      // Substitua pelo redirecionamento real para a página principal
      console.log("Usuário logado com sucesso!");
      navigate('/home'); // Redireciona para /home após o login
    } catch (error) {
      setLoading(false);
      if (error.code === "auth/user-not-found") {
        setError("Usuário não encontrado. Verifique seu e-mail.");
      } else if (error.code === "auth/wrong-password") {
        setError("Senha incorreta. Tente novamente.");
      } else if (error.code === "auth/invalid-email") {
        setError("E-mail inválido. Verifique e tente novamente.");
      } else {
        setError("Erro ao fazer login. Tente novamente mais tarde.");
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
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
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Carregando..." : "Entrar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
