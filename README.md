# Zap Discovery

A Nostr application that helps you discover active users and support them with Bitcoin Lightning zaps (zapvertisements).

## Features

- 🔍 **Smart Discovery**: Find random active Nostr users from recent activity
- 🤖 **Bot Filtering**: Automatically identifies and separates bots from real users
- 📊 **Query Statistics**: See detailed stats about discovered users and activity
- 📝 **Note Preview**: Review a user's recent posts before zapping
- ⚡ **Custom Zapvertisements**: Send zaps with personalized messages to promote yourself or say thanks
- 💜 **Beautiful UI**: Modern, responsive design with smooth animations

## How It Works

1. **Find Users**: Click "Find Random Users" to query recent Nostr activity
2. **Filter Bots**: The app automatically detects and marks accounts with "bot" in their profile
3. **Review Content**: Click "View Notes" to see a user's recent posts
4. **Send Zaps**: Support users you like with Bitcoin Lightning payments and custom messages

## Technology Stack

- React 18 with TypeScript
- Nostr Protocol (via Nostrify)
- Bitcoin Lightning (WebLN & NWC support)
- TailwindCSS for styling
- shadcn/ui components

## Discovery Algorithm

The app:
- Queries the last 500 notes from the past 6 hours
- Identifies unique authors
- Randomly selects up to 20 authors
- Fetches their profile metadata
- Filters out bots using keyword detection
- Sorts real users first, then by activity

## Bot Detection

Users are marked as bots if:
- Their profile has `bot: true` in metadata
- Their name, display name, or bio contains the word "bot"

## Zapvertisements

Send custom messages with your zaps to:
- Promote your own project or content
- Thank creators for their work
- Spread awareness about your Nostr presence
- Build connections with the community

## Getting Started

1. Log in with your Nostr account (NIP-07 extension or nsec)
2. Ensure you have a Lightning wallet configured (WebLN browser extension or Nostr Wallet Connect)
3. Click "Find Random Users" to start discovering
4. Review profiles and recent notes
5. Send zaps with custom messages!

---

Built with ❤️ on Nostr • [Vibed with Shakespeare](https://shakespeare.diy)
