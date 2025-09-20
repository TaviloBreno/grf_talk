'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Search, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  disabled?: boolean
}

// Basic emoji categories
const emojiCategories = {
  'Sorrisos': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  'Gestos': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
  'Objetos': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '⭐', '🌟', '💫', '⚡', '☄️', '💥', '🔥', '💯', '💢', '💨', '💦'],
  'Natureza': ['🌱', '🌿', '🍀', '🌾', '🌵', '🌴', '🌳', '🌲', '🌟', '⭐', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌈', '☀️', '🌞', '🌝', '🌚', '🌜', '🌛'],
  'Comida': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠'],
  'Atividades': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷']
}

const allEmojis = Object.values(emojiCategories).flat()

export function EmojiPicker({ onEmojiSelect, disabled = false }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Sorrisos')
  const [isOpen, setIsOpen] = useState(false)

  const filteredEmojis = searchQuery
    ? allEmojis.filter(emoji => 
        // Simple search - in real app you'd want emoji names/keywords
        emoji.includes(searchQuery)
      )
    : emojiCategories[activeCategory as keyof typeof emojiCategories] || []

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="shrink-0"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-4" 
        side="top" 
        align="end"
        sideOffset={8}
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar emojis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          {!searchQuery && (
            <div className="flex flex-wrap gap-1">
              {Object.keys(emojiCategories).map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className="text-xs h-7"
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          {/* Emoji Grid */}
          <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
            {filteredEmojis.map((emoji, index) => (
              <Button
                key={`${emoji}-${index}`}
                variant="ghost"
                size="sm"
                onClick={() => handleEmojiClick(emoji)}
                className="p-1 h-8 w-8 text-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {emoji}
              </Button>
            ))}
          </div>

          {filteredEmojis.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              {searchQuery ? 'Nenhum emoji encontrado' : 'Nenhum emoji disponível'}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default EmojiPicker