export default function EmreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: 0, fontFamily: "Inter, system-ui, sans-serif", background: "#0f172a", minHeight: "100vh" }}>
      {children}
    </div>
  );
}
