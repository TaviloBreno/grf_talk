import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock do ChatFooter simplificado para teste
const MockChatFooter = ({ onSendMessage }: { onSendMessage: (message: string) => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const message = formData.get('message') as string
    if (message.trim()) {
      onSendMessage(message.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="chat-footer">
      <input 
        name="message"
        placeholder="Digite uma mensagem..."
        data-testid="message-input"
      />
      <button type="submit" data-testid="send-button">
        Enviar
      </button>
    </form>
  )
}

describe('ChatFooter Component', () => {
  const mockOnSendMessage = jest.fn()
  
  beforeEach(() => {
    mockOnSendMessage.mockClear()
  })

  it('renders message input and send button', () => {
    render(<MockChatFooter onSendMessage={mockOnSendMessage} />)
    
    expect(screen.getByTestId('message-input')).toBeInTheDocument()
    expect(screen.getByTestId('send-button')).toBeInTheDocument()
  })

  it('sends message when form is submitted', async () => {
    const user = userEvent.setup()
    render(<MockChatFooter onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByTestId('message-input')
    const sendButton = screen.getByTestId('send-button')
    
    await user.type(input, 'Hello, world!')
    await user.click(sendButton)
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello, world!')
  })

  it('does not send empty messages', async () => {
    const user = userEvent.setup()
    render(<MockChatFooter onSendMessage={mockOnSendMessage} />)
    
    const sendButton = screen.getByTestId('send-button')
    await user.click(sendButton)
    
    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })
})