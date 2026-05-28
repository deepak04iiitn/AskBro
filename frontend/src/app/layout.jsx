import './globals.css'

export const metadata = {
  title: 'AskBro',
  description: 'RAG-powered internal knowledge assistant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
