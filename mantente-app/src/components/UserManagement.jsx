import React, { useState, useEffect } from "react";
import { pb } from "../pocketbase";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const UserManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "",
    twofa_enabled: false,
    blocked_until: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        pb.collection("users").getFullList({ fields: "id,email,name,role,twofa_enabled,blocked_until,created,last_login" }),
        pb.collection("roles").getFullList()
      ]);
      setUsers(usersRes);
      setRoles(rolesRes);
    } catch (error) {
      toast.error("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await pb.collection("users").update(editingUser.id, formData);
        toast.success("Usuario actualizado");
      } else {
        await pb.collection("users").create({
          ...formData,
          password: "TempPass123!", // Usuario debe cambiar
          passwordConfirm: "TempPass123!",
        });
        toast.success("Usuario creado");
      }
      setShowModal(false);
      setEditingUser(null);
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteUser = async (userId) => {
    if (confirm("¿Eliminar usuario?")) {
      try {
        await pb.collection("users").delete(userId);
        toast.success("Usuario eliminado");
        loadData();
      } catch (error) {
        toast.error("Error eliminando usuario");
      }
    }
  };

  const toggleBlock = async (user) => {
    try {
      const blocked_until = user.blocked_until ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await pb.collection("users").update(user.id, { blocked_until });
      toast.success(user.blocked_until ? "Usuario desbloqueado" : "Usuario bloqueado");
      loadData();
    } catch (error) {
      toast.error("Error cambiando estado");
    }
  };

  if (loading) return <div className="text-center p-4">Cargando...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Usuarios</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingUser(null);
            setFormData({ email: "", name: "", role: "", twofa_enabled: false, blocked_until: null });
            setShowModal(true);
          }}
        >
          Nuevo Usuario
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>2FA</th>
              <th>Estado</th>
              <th>Último Login</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name || "-"}</td>
                <td>{user.role?.name || "Sin rol"}</td>
                <td>{user.twofa_enabled ? "✅" : "❌"}</td>
                <td>
                  {user.blocked_until ? (
                    <span className="badge bg-danger">Bloqueado</span>
                  ) : (
                    <span className="badge bg-success">Activo</span>
                  )}
                </td>
                <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : "-"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => {
                      setEditingUser(user);
                      setFormData({
                        email: user.email,
                        name: user.name || "",
                        role: user.role?.id || "",
                        twofa_enabled: user.twofa_enabled || false,
                        blocked_until: user.blocked_until,
                      });
                      setShowModal(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-warning me-2"
                    onClick={() => toggleBlock(user)}
                  >
                    {user.blocked_until ? "Desbloquear" : "Bloquear"}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteUser(user.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Rol</label>
                    <select
                      className="form-control"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="">Sin rol</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-check-label">
                      <input
                        type="checkbox"
                        className="form-check-input me-2"
                        checked={formData.twofa_enabled}
                        onChange={(e) => setFormData({ ...formData, twofa_enabled: e.target.checked })}
                      />
                      Habilitar 2FA
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;