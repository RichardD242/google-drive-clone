import React from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
        <section className="bg-brand p-10">
            <div>
                <div className="space-y-5 text-white">
                    <h1 className="h1">manage your files the best way</h1>
                    <p className="body-1">this is the place to store your files</p>
                </div>
            </div>
        </section>
        {children}
    </div>
  )
}

export default Layout