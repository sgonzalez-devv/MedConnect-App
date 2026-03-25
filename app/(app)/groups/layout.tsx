"use client"

import { ReactNode } from "react"

interface GroupLayoutProps {
  children: ReactNode
}

export default function GroupLayout({ children }: GroupLayoutProps) {
  return <div className="w-full">{children}</div>
}
