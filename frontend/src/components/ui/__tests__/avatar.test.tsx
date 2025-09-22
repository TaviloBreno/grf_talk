import { render, screen } from '@testing-library/react'
import { Avatar, AvatarImage, AvatarFallback } from '../avatar'

describe('Avatar Component', () => {
  it('renders fallback when image fails to load', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/broken-link.jpg" alt="User Avatar" />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )
    
    // Avatar component shows fallback when image fails to load
    const fallback = screen.getByText('UA')
    expect(fallback).toBeInTheDocument()
  })

  it('renders fallback when no image src is provided', () => {
    render(
      <Avatar>
        <AvatarImage alt="User Avatar" />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )
    
    const fallback = screen.getByText('UA')
    expect(fallback).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(
      <Avatar className="custom-avatar">
        <AvatarImage alt="User Avatar" />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )
    
    const avatar = screen.getByText('UA').closest('[data-slot="avatar"]')
    expect(avatar).toHaveClass('custom-avatar')
  })

  it('renders avatar with data-slot attributes', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )
    
    const avatar = screen.getByText('UA').closest('[data-slot="avatar"]')
    expect(avatar).toBeInTheDocument()
  })
})