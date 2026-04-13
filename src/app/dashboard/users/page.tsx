"use client";

import { useAuth } from "@/lib/firebase/AuthContext";
import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { AppUser } from "@/types/user";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

export default function UsersPage() {
  const { appUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin"|"user">("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function loadUsers() {
      if (!appUser || appUser.role !== "admin") return;
      
      try {
        const db = getFirestore();
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("tenantId", "==", appUser.tenantId));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data() as AppUser);
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [appUser]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || appUser.role !== "admin") return;
    
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });
    
    try {
      // 1. Initialize secondary Firebase app to prevent logging out
      const primaryApp = getApps()[0];
      let secondaryApp = getApps().find(app => app.name === "Secondary");
      if (!secondaryApp) {
        secondaryApp = initializeApp(primaryApp.options, "Secondary");
      }
      
      const secondaryAuth = getAuth(secondaryApp);
      
      // 2. Create the user in Auth
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUid = userCredential.user.uid;
      
      // 3. Immediately sign out the secondary instance to be safe
      await signOut(secondaryAuth);
      
      // 4. Create Firestore user document using primary app
      const db = getFirestore();
      const newUserDoc: AppUser = {
        uid: newUid,
        email,
        name,
        role,
        tenantId: appUser.tenantId, // Bind them to this admin's tenant
        createdAt: new Date().toISOString(),
        emailNotifications: true // Default to true
      };
      
      await setDoc(doc(db, "users", newUid), newUserDoc);
      
      setUsers([...users, newUserDoc]);
      setName(""); setEmail(""); setPassword(""); setRole("user");
      setMessage({ text: "Kullanıcı başarıyla oluşturuldu.", type: "success" });
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || "Bir hata oluştu", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (uid === appUser.uid) {
      alert("Kendi hesabınızı silemezsiniz.");
      return;
    }
    if (!confirm("Bu personelin erişimini kaldırmak istediğinize emin misiniz?")) return;

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "users", uid));
      setUsers(users.filter(u => u.uid !== uid));
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Kullanıcı silinirken bir hata oluştu.");
    }
  };

  const toggleNotifications = async (targetUser: AppUser) => {
    try {
      const db = getFirestore();
      const newVal = !targetUser.emailNotifications;
      await setDoc(doc(db, "users", targetUser.uid), {
        ...targetUser,
        emailNotifications: newVal
      });
      setUsers(users.map(u => u.uid === targetUser.uid ? { ...u, emailNotifications: newVal } : u));
    } catch (err) {
      console.error("Failed to update notifications", err);
    }
  };

  if (!appUser) return <div>Yükleniyor...</div>;

  if (appUser.role !== "admin") {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⛔</div>
        <div className="empty-state-title">Yetkisiz Erişim</div>
        <div className="empty-state-description">Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1 className="page-title">Personel Yönetimi</h1>
        <p className="page-subtitle">Şirketiniz için yeni kullanıcılar oluşturun ve yetkilerini yönetin.</p>
      </div>

      <div className="grid-2" style={{ gap: "var(--space-8)" }}>
        {/* ADD USER FORM */}
        <div className="card" style={{ padding: "var(--space-6)" }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>Yeni Personel Ekle</h3>
          
          {message.text && (
            <div className={`toast toast-${message.type}`} style={{ position: "relative", marginBottom: "var(--space-4)", right: "auto", bottom: "auto", maxWidth: "100%" }}>
               <div className="toast-message">
                  {message.text}
               </div>
            </div>
          )}

          <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>Ad Soyad</label>
              <input type="text" className="input w-full" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>E-posta</label>
              <input type="email" className="input w-full" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>Geçici Şifre</label>
              <input type="password" className="input w-full" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>Yetki</label>
              <select className="input w-full" value={role} onChange={e => setRole(e.target.value as "admin"|"user")}>
                <option value="user">Standart Personel (Sadece Görüntüleme/Ekleme)</option>
                <option value="admin">Yönetici (Kullanıcı Ekleyebilir)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Oluşturuluyor..." : "Personel Hesabı Oluştur"}
            </button>
          </form>
        </div>

        {/* USER LIST */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Aktif Personeller</div>
              <div className="card-subtitle">Platforma erişimi olan takım arkadaşlarınız</div>
            </div>
          </div>
          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: "var(--space-4)" }}>Yükleniyor...</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Ad Soyad</th>
                    <th>E-posta</th>
                    <th>Yetki</th>
                    <th>Bildirimler</th>
                    <th style={{ textAlign: "right" }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.uid}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>
                          {u.role === 'admin' ? 'Yönetici' : 'Personel'}
                        </span>
                        {u.uid === appUser.uid && <span style={{ marginLeft: 8, fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>(Sen)</span>}
                      </td>
                      <td>
                        <button 
                          onClick={() => toggleNotifications(u)}
                          className={`badge ${u.emailNotifications !== false ? 'badge-blue' : 'badge-gray'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                        >
                          {u.emailNotifications !== false ? '🔔 Aktif' : '🔕 Kapalı'}
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {u.uid !== appUser.uid && (
                          <button 
                            onClick={() => handleDeleteUser(u.uid)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: "var(--danger-500)", padding: "4px 8px" }}
                            title="Personeli Kaldır"
                          >
                            🗑️
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", color: "var(--text-tertiary)" }}>Kayıtlı veri yok.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
