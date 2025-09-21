import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Avatar, AvatarFallback, AvatarImage } from '../avatar'

describe('Avatar Component', () => {
  it('renders avatar image when src is provided', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )
    
    const avatarImage = screen.getByRole('img')
    expect(avatarImage).toBeDefined()
    expect(avatarImage.getAttribute('src')).toBe('https://example.com/avatar.jpg')
  })

  it('renders fallback when no image src is provided', () => {
    render(
      <Avatar>
        <AvatarImage alt="User Avatar" />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )
    
    const fallback = screen.getByText('UA')
    expect(fallback).toBeDefined()
  })

  it('renders with custom className', () => {
    render(
      <Avatar className="custom-avatar">
        <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )
    
    const avatar = screen.getByRole('img').parentElement
    expect(avatar?.className).toContain('custom-avatar')
  })

  it('renders with alt text', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )
    
    const avatarImage = screen.getByRole('img')
    expect(avatarImage.getAttribute('alt')).toBe('User Avatar')
  })

  it('renders fallback with custom className', () => {
    render(
      <Avatar>
        <AvatarFallback className="custom-fallback">UA</AvatarFallback>
      </Avatar>
    )
    
    const fallback = screen.getByText('UA')
    expect(fallback.className).toContain('custom-fallback')
  })
})