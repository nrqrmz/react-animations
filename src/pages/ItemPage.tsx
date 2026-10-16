import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Example of a dynamic route (/items/:id). The id comes from the URL.
// In a real app, use it to fetch one record from Supabase, e.g.:
//   const { data } = await supabase.from('items').select('*').eq('id', id).single()
export default function ItemPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/">&larr; Back</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Item {id}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          The URL parameter is <code className="rounded bg-muted px-1">{id}</code>. Reload this page: it keeps working.
        </CardContent>
      </Card>
    </div>
  )
}
