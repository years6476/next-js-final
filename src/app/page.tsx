import { redirect } from 'next/navigation'

export default function RootPage() {
  // Auth check হবে client side, এখন signup-এ পাঠাও
  redirect('/signup')
}
