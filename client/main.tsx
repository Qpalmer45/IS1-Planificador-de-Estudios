import { useEffect, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import { api, ApiError, type User, type Task } from "./api";
import "./style.css";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState("");
  const [notice, setNotice] = useState("");
  async function restoreSession() {
    setLoading(true);
    setBootError("");
    try {
      const data = await api<{ user: User }>("/auth/me");
      setUser(data.user);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401))
        setBootError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void restoreSession();
  }, []);
  return (
    <>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Planificador, inicio">
          <span className="brand-icon">✓</span> Planificador
          <span className="tag">IS1</span>
        </a>
        <span className="top-note">Un paso cada día.</span>
      </header>
      {loading ? (
        <main className="loading" role="status">
          Cargando tu espacio…
        </main>
      ) : bootError ? (
        <main className="loading">
          <p role="alert">{bootError}</p>
          <button onClick={() => void restoreSession()}>Reintentar</button>
        </main>
      ) : user ? (
        <Tasks
          user={user}
          onLogout={() => {
            setUser(null);
            setNotice("Has cerrado sesión.");
          }}
          onExpired={() => {
            setUser(null);
            setNotice("Tu sesión ha caducado. Vuelve a entrar.");
          }}
        />
      ) : (
        <Auth
          notice={notice}
          onLogin={(value) => {
            setUser(value);
            setNotice("");
          }}
        />
      )}
      <footer>
        Planificador de Estudios · Ingeniería del Software I · UCM
      </footer>
    </>
  );
}
function Auth({
  onLogin,
  notice,
}: {
  onLogin: (user: User) => void;
  notice: string;
}) {
  const [register, setRegister] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(notice);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    setMessage("");
    if (register && data.get("password") !== data.get("confirm")) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      if (register) {
        await api("/auth/register", "POST", {
          name: data.get("name"),
          email: data.get("email"),
          password: data.get("password"),
        });
        form.reset();
        setRegister(false);
        setMessage("Cuenta creada. Ya puedes iniciar sesión.");
      } else {
        const { user } = await api<{ user: User }>("/auth/login", "POST", {
          email: data.get("email"),
          password: data.get("password"),
        });
        onLogin(user);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-layout">
      <section className="intro">
        <p className="eyebrow">TU ESPACIO DE ESTUDIO</p>
        <h1>
          Haz sitio para <br />
          lo importante.
        </h1>
        <p className="lead">
          Tus pendientes, en un solo lugar.
          <br />
          Organiza tu día y avanza a tu ritmo.
        </p>
        <div className="illustration" aria-hidden="true">
          <div className="paper">
            <span className="paper-label">UN DÍA, PASO A PASO</span>
            <div>
              <i className="checked">✓</i>
              <s>Dar el primer paso</s>
            </div>
            <div>
              <i className="checked">✓</i>
              <s>Ordenar las ideas</s>
            </div>
            <div>
              <i></i>Preparar lo siguiente
            </div>
            <span className="paper-bottom">Cada pequeño avance cuenta.</span>
          </div>
          <span className="spark">✳</span>
        </div>
      </section>
      <section className="auth-card" aria-label="Acceso a tu cuenta">
        <div className="tabs">
          <button
            type="button"
            className={!register ? "active" : ""}
            aria-pressed={!register}
            disabled={busy}
            onClick={() => {
              setRegister(false);
              setError("");
              setMessage("");
            }}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={register ? "active" : ""}
            aria-pressed={register}
            disabled={busy}
            onClick={() => {
              setRegister(true);
              setError("");
              setMessage("");
            }}
          >
            Crear cuenta
          </button>
        </div>
        <h2>{register ? "Empieza por aquí." : "Qué bien verte."}</h2>
        <p className="muted">
          {register
            ? "Crea tu cuenta y organiza tus primeras tareas."
            : "Entra para continuar con tus tareas."}
        </p>
        {message && (
          <p className="success" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <form onSubmit={submit} key={register ? "register" : "login"}>
          {register && (
            <label>
              Nombre
              <input
                name="name"
                autoComplete="name"
                placeholder="Tu nombre"
                required
                maxLength={80}
                disabled={busy}
              />
            </label>
          )}
          <label>
            Correo electrónico
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              required
              maxLength={254}
              disabled={busy}
            />
          </label>
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              placeholder={register ? "Mínimo 8 caracteres" : "Tu contraseña"}
              required
              minLength={register ? 8 : 1}
              maxLength={128}
              disabled={busy}
            />
          </label>
          {register && (
            <label>
              Repite la contraseña
              <input
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                disabled={busy}
              />
            </label>
          )}
          <button className="primary full" disabled={busy}>
            {busy
              ? "Un momento…"
              : register
                ? "Crear mi cuenta"
                : "Entrar a mi espacio"}
            <span aria-hidden="true"> →</span>
          </button>
        </form>
        <p className="card-foot">Tus tareas se guardan en tu cuenta.</p>
      </section>
    </main>
  );
}
function Tasks({
  user,
  onLogout,
  onExpired,
}: {
  user: User;
  onLogout: () => void;
  onExpired: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  function fail(err: unknown) {
    if (err instanceof ApiError && err.status === 401) onExpired();
    else setError((err as Error).message);
  }
  async function load() {
    setLoading(true);
    setError("");
    try {
      setTasks((await api<{ tasks: Task[] }>("/tasks")).tasks);
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const title = String(new FormData(form).get("title") ?? "").trim();
    if (!title) {
      setError("Escribe un título para la tarea.");
      return;
    }
    await run(async () => {
      const { task } = await api<{ task: Task }>("/tasks", "POST", { title });
      setTasks((old) => [task, ...old]);
      form.reset();
      setFilter("all");
      setMessage("Tarea añadida.");
    });
  }
  async function edit(
    id: string,
    change: { title?: string; completed?: boolean },
  ) {
    await run(async () => {
      const { task } = await api<{ task: Task }>(
        `/tasks/${id}`,
        "PATCH",
        change,
      );
      setTasks((old) => old.map((item) => (item.id === id ? task : item)));
      setEditing(null);
      setMessage("Tarea actualizada.");
    });
  }
  const completed = tasks.filter((t) => t.completed).length;
  const visible = tasks.filter(
    (t) => filter === "all" || (filter === "done" ? t.completed : !t.completed),
  );
  return (
    <main className="workspace">
      <div className="welcome">
        <div>
          <p className="eyebrow">MI ESPACIO</p>
          <h1>Hola, {user.name}.</h1>
          <p className="muted">Un pequeño plan para un buen día.</p>
        </div>
        <button
          className="secondary"
          disabled={busy}
          onClick={() =>
            void run(async () => {
              await api("/auth/logout", "POST");
              onLogout();
            })
          }
        >
          Cerrar sesión
        </button>
      </div>
      <div className="dashboard">
        <section className="task-card">
          <div className="section-heading">
            <h2>Mis tareas</h2>
            <span className="count">{tasks.length}</span>
          </div>
          <form className="add-form" onSubmit={add}>
            <label className="sr-only" htmlFor="new-task">
              Nueva tarea
            </label>
            <input
              id="new-task"
              name="title"
              placeholder="¿Qué tienes pendiente?"
              required
              maxLength={200}
              disabled={busy || loading}
            />
            <button className="primary" disabled={busy || loading}>
              Añadir
            </button>
          </form>
          <div className="filters" aria-label="Filtrar tareas">
            {(
              [
                ["all", "Todas"],
                ["pending", "Pendientes"],
                ["done", "Completadas"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                aria-pressed={filter === value}
                className={filter === value ? "selected" : ""}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          {error && (
            <div className="error" role="alert">
              {error}{" "}
              <button disabled={busy || loading} onClick={() => void load()}>
                Recargar lista
              </button>
            </div>
          )}
          <p className="sr-only" role="status">
            {message}
          </p>
          {loading ? (
            <p className="empty" role="status">
              Cargando tareas…
            </p>
          ) : visible.length === 0 ? (
            <div className="empty">
              <span aria-hidden="true">
                {filter === "pending" && tasks.length ? "✓" : "✳"}
              </span>
              <h3>
                {tasks.length === 0
                  ? "Aquí empieza tu próximo paso."
                  : "No hay tareas en esta vista."}
              </h3>
              <p>
                {tasks.length === 0
                  ? "Añade tu primera tarea en el campo de arriba."
                  : "Puedes cambiar el filtro para ver las demás."}
              </p>
            </div>
          ) : (
            <ul className="task-list">
              {visible.map((task) => (
                <li
                  key={task.id}
                  className={task.completed ? "task done" : "task"}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    disabled={busy}
                    aria-label={`Completar: ${task.title}`}
                    onChange={(event) =>
                      void edit(task.id, { completed: event.target.checked })
                    }
                  />
                  {editing === task.id ? (
                    <form
                      className="edit-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const title = String(
                          new FormData(event.currentTarget).get("title") ?? "",
                        ).trim();
                        if (!title) {
                          setError("El título no puede estar vacío.");
                          return;
                        }
                        void edit(task.id, { title });
                      }}
                    >
                      <label className="sr-only" htmlFor={`edit-${task.id}`}>
                        Editar título
                      </label>
                      <input
                        id={`edit-${task.id}`}
                        autoFocus
                        name="title"
                        defaultValue={task.title}
                        required
                        maxLength={200}
                        disabled={busy}
                      />
                      <button disabled={busy} className="text-button">
                        Guardar
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        className="text-button"
                        onClick={() => setEditing(null)}
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="task-title">{task.title}</span>
                      <div className="task-actions">
                        <button
                          className="text-button"
                          disabled={busy}
                          aria-label={`Editar: ${task.title}`}
                          onClick={() => {
                            setEditing(task.id);
                            setDeleteId(null);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="text-button danger"
                          disabled={busy}
                          aria-label={`Eliminar: ${task.title}`}
                          onClick={() => setDeleteId(task.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                  {deleteId === task.id && (
                    <div className="delete-confirm">
                      <span>¿Eliminar esta tarea?</span>
                      <button
                        className="text-button danger"
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            await api(`/tasks/${task.id}`, "DELETE");
                            setTasks((old) =>
                              old.filter((t) => t.id !== task.id),
                            );
                            setDeleteId(null);
                            setMessage("Tarea eliminada.");
                          })
                        }
                      >
                        Sí, eliminar
                      </button>
                      <button
                        className="text-button"
                        disabled={busy}
                        onClick={() => setDeleteId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="progress-card">
          <p className="eyebrow">PASO A PASO</p>
          <h2>Tu progreso</h2>
          <p className="progress-number">
            {completed}
            <span> / {tasks.length}</span>
          </p>
          <p className="muted">tareas completadas</p>
          <progress
            value={completed}
            max={tasks.length || 1}
            aria-label="Progreso de tareas"
          />
          <p className="progress-note">
            {tasks.length > 0 && completed === tasks.length
              ? "Todo al día. ¡Buen trabajo!"
              : "No tienes que hacerlo todo a la vez. Empieza por una tarea."}
          </p>
        </aside>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
