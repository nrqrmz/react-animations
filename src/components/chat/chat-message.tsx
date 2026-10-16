import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export type ChatRole = 'user' | 'assistant'

interface ChatMessageProps {
  role: ChatRole
  content: string
  className?: string
}

/** A single chat bubble. User messages are right-aligned, assistant messages left-aligned. */
export function ChatMessage({ role, content, className }: ChatMessageProps) {
  const isUser = role === 'user'
  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse', className)}>
      <Avatar>
        <AvatarFallback>{isUser ? 'U' : 'AI'}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
        )}
      >
        {content}
      </div>
    </div>
  )
}
