import './globals.css'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata = {
  title: 'AskBro',
  description: 'RAG-powered internal knowledge assistant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
