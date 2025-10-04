
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const currencies = [
  { code: 'VND', name: 'Vietnamese Dong (₫)' },
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
  { code: 'CNY', name: 'Chinese Yuan (¥)' },
  { code: 'THB', name: 'Thai Baht (฿)' },
  { code: 'SGD', name: 'Singapore Dollar (S$)' },
  { code: 'AUD', name: 'Australian Dollar (A$)' },
  { code: 'CAD', name: 'Canadian Dollar (C$)' },
]

interface CreateTripButtonProps {
  variant?: 'default' | 'outline'
}

export function CreateTripButton({ variant = 'default' }: CreateTripButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    currency: 'VND',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.()
    
    if (!formData?.name?.trim()) {
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData?.name?.trim(),
          location: formData?.location?.trim() || null,
          startDate: formData?.startDate || null,
          endDate: formData?.endDate || null,
          currency: formData?.currency || 'VND',
        }),
      })

      if (response?.ok) {
        const data = await response?.json?.()
        router?.push?.(`/trips/${data?.id ?? ''}`)
        router?.refresh?.()
      }
    } catch (error) {
      console.error('Error creating trip:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size="lg"
          className={variant === 'default' ? 'bg-white text-blue-600 hover:bg-white/90 shadow-lg' : ''}
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create New Trip
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
          <DialogDescription>
            Add details about your trip. You can add members and expenses later.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Trip Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Summer Beach Vacation"
              value={formData?.name ?? ''}
              onChange={(e) => setFormData({ ...formData, name: e?.target?.value ?? '' })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Bali, Indonesia"
              value={formData?.location ?? ''}
              onChange={(e) => setFormData({ ...formData, location: e?.target?.value ?? '' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData?.startDate ?? ''}
                onChange={(e) => setFormData({ ...formData, startDate: e?.target?.value ?? '' })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData?.endDate ?? ''}
                onChange={(e) => setFormData({ ...formData, endDate: e?.target?.value ?? '' })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData?.currency ?? 'VND'}
              onValueChange={(value) => setFormData({ ...formData, currency: value ?? 'VND' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies?.map((currency) => (
                  <SelectItem key={currency?.code ?? ''} value={currency?.code ?? ''}>
                    {currency?.name ?? ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData?.name?.trim()}>
              {loading ? 'Creating...' : 'Create Trip'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
