import LoginForm from './LoginForm'

export const metadata = {
  title: 'Masuk | Astacita Pendidikan',
  description: 'Portal Publikasi Siaran Pers Sekolah',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <LoginForm />
      </div>
    </div>
  )
}
