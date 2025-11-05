'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle } from "lucide-react"

export function CreateEventDialog() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real implementation, this would call a server action.
    toast({
        title: "Feature not implemented",
        description: "Creating events will be available soon.",
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Add a new time slot to your schedule. You can make it swappable later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                Title
                </Label>
                <Input id="title" defaultValue="Team Meeting" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-time" className="text-right">
                Start Time
                </Label>
                <Input id="start-time" type="datetime-local" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-time" className="text-right">
                End Time
                </Label>
                <Input id="end-time" type="datetime-local" className="col-span-3" />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit">Create</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
