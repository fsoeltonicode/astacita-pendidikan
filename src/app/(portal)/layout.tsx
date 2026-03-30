import Navbar from '@/components/portal/Navbar'
import Footer from '@/components/portal/Footer'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-white">
        {children}
      </main>
      <Footer />
    </div>
  )
}
