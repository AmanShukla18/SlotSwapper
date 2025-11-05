# **App Name**: TimeSwap

## Core Features:

- User Authentication: Allow users to sign up and log in using email/password, managed with JWT for session authentication.
- Event Management: Enable users to create, read, update, and delete their own calendar events, marking them as busy or swappable.
- Swappable Slot Discovery: Endpoint to fetch all swappable slots from other users, excluding the current user's slots.
- Swap Request: Allow users to request a swap, locking both slots until the request is resolved.
- Swap Response: Enable users to accept or reject swap requests, updating calendar slots accordingly.
- Calendar View: Display user's own events and mark the status (e.g. BUSY, SWAPPABLE).
- Marketplace View: Show swappable slots of other users and enable users to make swap requests

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to evoke trust and efficiency.
- Background color: Light gray (#F5F5F5) for a clean and modern look.
- Accent color: Soft purple (#9575CD) to highlight interactive elements.
- Body and headline font: 'Inter', a sans-serif font with a neutral, objective, and modern appearance, for excellent readability and a clean UI. 
- Use clear, consistent icons from a standard library (e.g., Material Design Icons) to represent event types and actions.
- Employ a clean, grid-based layout to display calendar events and available slots in a structured manner.
- Use subtle transitions and animations to provide visual feedback on interactions (e.g., when a swap request is sent or a slot is updated).