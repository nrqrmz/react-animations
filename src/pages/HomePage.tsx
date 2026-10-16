import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Example data. Replace with real data from Supabase.
const items = [1, 2, 3]

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome</h1>
        <p className="text-muted-foreground">
          This is an example page. Ask Claude Code to replace it with your own app.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((id) => (
          <Card key={id}>
            <CardHeader>
              <CardTitle>Item {id}</CardTitle>
              <CardDescription>Example of a dynamic route.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link to={`/items/${id}`}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
