import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatFooter } from '../ChatFooter'

// Mock the EmojiPicker component
jest.mock('../EmojiPicker', () => ({
  EmojiPicker: ({ onEmojiSelect }: { onEmojiSelect: (emoji: string) => void }) => (
    <div data-testid="emoji-picker">
      <button onClick={() => onEmojiSelect('😀')}>😀</button>
    </div>
  )
}))

// Mock the AudioRecorder component
jest.mock('../AudioRecorder', () => ({
  AudioRecorder: ({ onRecordingComplete }: { onRecordingComplete: (blob: Blob) => void }) => (
    <div data-testid="audio-recorder">
      <button onClick={() => onRecordingComplete(new Blob())}>Record</button>
    </div>
  )
}))

describe('ChatFooter Component', () => {
  const mockOnSendMessage = jest.fn()
  
  beforeEach(() => {
    mockOnSendMessage.mockClear()
  })

  it('renders message input and send button', () => {
    render(<ChatFooter onSendMessage={mockOnSendMessage} />)
    
    expect(screen.getByPlaceholderText('Digite uma mensagem...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar mensagem/i })).toBeInTheDocument()
  })

  it('sends message when send button is clicked', async () => {
    const user = userEvent.setup()
    render(<ChatFooter onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText('Digite uma mensagem...')
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i })
    
    await user.type(input, 'Hello, world!')
    await user.click(sendButton)
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello, world!')
    expect(input).toHaveValue('')
  })

  it('sends message when Enter key is pressed', async () => {
    const user = userEvent.setup()
    render(<ChatFooter onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText('Digite uma mensagem...')
    
    await user.type(input, 'Hello, world!')
    await user.keyboard('{Enter}')
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello, world!')
    expect(input).toHaveValue('')
  })

  it('does not send empty messages', async () => {
    const user = userEvent.setup()
    render(<ChatFooter onSendMessage={mockOnSendMessage} />)
    
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i })
    
    await user.click(sendButton)
    
    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })

  it('does not send messages with only whitespace', async () => {
    const user = userEvent.setup()
    render(<ChatFooter onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText('Digite uma mensagem...')
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i })
    
    await user.type(input, '   ')
    await user.click(sendButton)
    
    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })

  it('opens emoji picker when emoji button is clicked', async () => {
    const user = userEvent.setup()
    render(<ChatFooter onSendMessage={mockOnSendMessage} />)
    
    const emojiButton = screen.getByRole('button', { name: /emoji/i })
    await user.click(emojiButton)
    
    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument()
  })

  it('adds emoji to message when emoji is selected', async () => {
    const user = userEvent.setup()
    render(<ChatFooter onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText('Digite uma mensagem...')
    const emojiButton = screen.getByRole('button', { name: /emoji/i })
    
    await user.type(input, 'Hello ')
    await user.click(emojiButton)
    
    const emojiOption = screen.getByText('😀')
    await user.click(emojiOption)
    
    expect(input).toHaveValue('Hello 😀')
  })

  it('handles file attachment', async () => {
    const user = userEvent.setup()
    render(<ChatFooter onSendMessage={mockOnSendMessage} />)
    
    const fileInput = screen.getByLabelText(/anexar arquivo/i)
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    
    await user.upload(fileInput, file)
    
    // Check if file is attached (this might need adjustment based on actual implementation)
    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument()
    })
  })

  it('shows audio recorder when microphone button is clicked', async () => {
    const user = userEvent.setup()
    render(<ChatFooter onSendMessage={mockOnSendMessage} />)
    
    const micButton = screen.getByRole('button', { name: /gravar áudio/i })
    await user.click(micButton)
    
    expect(screen.getByTestId('audio-recorder')).toBeInTheDocument()
  })

  it('disables send button while sending', () => {
    render(<ChatFooter onSendMessage={mockOnSendMessage} disabled />)
    
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i })
    expect(sendButton).toBeDisabled()
  })

  it('supports multiline messages with Shift+Enter', async () => {
    const user = userEvent.setup()
    render(<ChatFooter onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText('Digite uma mensagem...')
    
    await user.type(input, 'Line 1')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    await user.type(input, 'Line 2')
    
    expect(input).toHaveValue('Line 1\\nLine 2')
    
    // Should not send on Shift+Enter
    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })
})