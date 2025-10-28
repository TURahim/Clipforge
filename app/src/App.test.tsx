import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })

  it('displays ClipForge title', () => {
    render(<App />)
    expect(screen.getByText('ClipForge')).toBeInTheDocument()
  })

  it('shows PR #1 completion status', () => {
    render(<App />)
    expect(screen.getByText(/Project Setup Complete/i)).toBeInTheDocument()
  })

  it('lists configured features', () => {
    render(<App />)
    expect(screen.getByText(/Electron \+ Vite configured/i)).toBeInTheDocument()
    expect(screen.getByText(/React \+ TypeScript ready/i)).toBeInTheDocument()
    expect(screen.getByText(/TailwindCSS enabled/i)).toBeInTheDocument()
  })
})

