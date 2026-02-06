import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { Login } from '../pages/Login'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  },
}))

describe('Login Page', () => {
  it('renders login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    // Use getByRole with more specificity or getByText if role is ambiguous due to multiple buttons
    // The main login button is type="submit"
    const submitButtons = screen.getAllByRole('button', { name: /Entrar/i })
    const loginButton = submitButtons.find(btn => btn.getAttribute('type') === 'submit')
    expect(loginButton).toBeInTheDocument()
  })

  it('validates invalid email', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText('seu@email.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    const submitButtons = screen.getAllByRole('button', { name: /Entrar/i })
    const submitButton = submitButtons.find(btn => btn.getAttribute('type') === 'submit')!
    const form = submitButton.closest('form')!

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    fireEvent.submit(form)

    // Wait for the error message to appear
    const errorMessage = await screen.findByText('Email inválido')
    expect(errorMessage).toBeInTheDocument()
  })
})
