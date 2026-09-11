import Sidebar from './components/Sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* Sidebar uses `fixed` positioning (see Sidebar.tsx), which takes it out
          of normal document flow — flexbox/`flex-1` on <main> does NOT push.
          past a fixed element. That's why content was rendering underneath it. */}
      <Sidebar />

      {/* pl-72 reserves exactly the sidebar's width (w-72 = 18rem) so content
          sits beside it instead of behind it. No background or text color
          here on purpose — each admin page (dashboard, categories, etc.) sets
          its own theme, and a dark bg/text here would fight with light pages
          like Categories and cause exactly the "invisible text" issue. */}
      <main className="pl-72">
        {children}
      </main>
    </div>
  )
}