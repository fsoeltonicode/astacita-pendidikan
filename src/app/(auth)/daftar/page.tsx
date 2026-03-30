import RegisterForm from './RegisterForm'

export const metadata = {
  title: 'Pendaftaran Sekolah | Astacita Pendidikan',
  description: 'Daftarkan NPSN Humas Sekolah Anda',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex py-10 items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <RegisterForm />
      </div>
    </div>
  )
}
