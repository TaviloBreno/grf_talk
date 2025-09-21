impor  it('renders avatar image when src is provided', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )
    
    const avatarImage = screen.getByRole('img')
    expect(avatarImage).toBeDefined()
    expect(avatarImage.getAttribute('src')).toBe('https://example.com/avatar.jpg') screen } from '@testing-library/react'
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
    
    const avatarImage = screen.getByRole('img', { name: 'User Avatar' })
    expect(avatarImage).toBeInTheDocument()
    expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('renders avatar fallback when image is not provided', () => {
    render(
      <Avatar>
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )
    
    expect(screen.getByText('UA')).toBeInTheDocument()
  })

  it('renders avatar fallback when image fails to load', () => {
    render(
      <Avatar>
        <AvatarImage src="invalid-url" alt="User Avatar" />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )
    
    // Simulate image load error
    const avatarImage = screen.getByRole('img', { name: 'User Avatar' })
    avatarImage.dispatchEvent(new Event('error'))
    
    expect(screen.getByText('UA')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Avatar className="custom-avatar">
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )
    
    const avatar = screen.getByText('UA').parentElement
    expect(avatar).toHaveClass('custom-avatar')
  })

  it('renders with correct accessibility attributes', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )
    
    const avatarImage = screen.getByRole('img', { name: 'User Avatar' })
    expect(avatarImage).toHaveAttribute('alt', 'User Avatar')
  })
})